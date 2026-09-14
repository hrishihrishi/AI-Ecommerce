import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb";
import { z } from "zod";
import "dotenv/config";

// takes a callback function returns else retries 'maxRetries' times
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        console.log(`Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

export async function callAgent(
  client: MongoClient,
  query: string,
  thread_id: string,
) {
  try {
    // initialize the MongoDB client and connect to the database
    const dbName = "vector_database";
    const db = client.db(dbName);
    const collection = db.collection("itemsWsummary");

    console.log(
      "Call Agent called with query:",
      query,
      "and thread_id:",
      thread_id,
    );

    // Define the state graph and its root annotation [KNOW MORE]
    const GraphState = Annotation.Root({
      messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
      }),
    });

    // Pass user query.
    const itemLookupTool = tool(
      // user query passed to the tool. Does vector search on DB, if no results, does text search on DB. Returns results as JSON string.
      async ({ query, n = 10 }) => {
        try {
          console.log("Item lookup tool called with query:", query);

          const totalCount = await collection.countDocuments();
          console.log(`Total documents in collection: ${totalCount}`);

          // If collection is empty, return an error.
          if (totalCount === 0) {
            console.log("Collection is empty");
            return JSON.stringify({
              error: "No items found in inventory",
              message: "The inventory database appears to be empty",
              count: 0,
            });
          }

          const sampleDocs = await collection.find({}).limit(3).toArray();
          console.log("Sample documents:", sampleDocs);

          const dbConfig = {
            collection: collection,
            indexName: "vector_index",
            textKey: "embedding_text",
            embeddingKey: "embedding",
          };

          const vectorStore = new MongoDBAtlasVectorSearch(
            new GoogleGenerativeAIEmbeddings({
              apiKey: process.env.GOOGLE_API_KEY,
              model: "gemini-embedding-001",
            }),
            dbConfig,
          );

          console.log("Performing vector search...");
          const result = await vectorStore.similaritySearchWithScore(query, n);
          console.log(`Vector search returned ${result.length} results`);

          // If vector search returns no results, perform a text search as a fallback.
          if (result.length === 0) {
            console.log(
              "Vector search returned no results, trying text search...",
            );
            const textResults = await collection
              .find({
                // Or search, so any matching field will be returned.
                $or: [
                  { name: { $regex: query, $options: "i" } },
                  { description: { $regex: query, $options: "i" } },
                  { category: { $regex: query, $options: "i" } },
                  { embedding_text: { $regex: query, $options: "i" } },
                ],
              })
              .limit(n) // limit to 10
              .toArray();
            console.log(`Text search returned ${textResults.length} results`);

            return JSON.stringify({
              results: textResults,
              searchType: "text",
              query: query,
              count: textResults.length,
            });
          }

          // why return searchType: vector? because the tool can return either vector search results or text search results, and we want to indicate which type of search was performed in the response. This helps the agent understand the context of the results and how to interpret them.
          return JSON.stringify({
            results: result,
            searchType: "vector",
            query: query,
            count: result.length,
          });
        } catch (error: any) {
          console.error("Error in item lookup:", error);
          return JSON.stringify({
            error: "Failed to search inventory",
            details: error.message,
            query: query,
          });
        }
      },

      // tool metadata for the agent to understand how to use the tool.
      {
        name: "item_lookup",
        description:
          "Gathers product details from the database (named vector_database) for the E-commerce Chatbot Agent",
        schema: z.object({
          query: z.string().describe("The search query"),
          n: z
            .number()
            .optional()
            .default(10)
            .describe("Number of results to return"),
        }),
      },
    );

    const tools = [itemLookupTool];
    const toolNode = new ToolNode<typeof GraphState.State>(tools);

    // Initialize models with tools, so it becomes an Agent.
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-3.6-flash",
      temperature: 0,
      maxRetries: 0,
      apiKey: process.env.GOOGLE_API_KEY,
    }).bindTools(tools);

    // Desicion making function to end or call tools.
    function shouldContinue(state: typeof GraphState.State) {
      const messages = state.messages;
      const lastMessage = messages[messages.length - 1] as AIMessage;

      if (lastMessage.tool_calls?.length) {
        return "tools";
      }
      return "__end__";
    }

    // Calls the model with the current state, and returns the next state. This is where the model generates a response based on the current conversation state.
    async function callModel(state: typeof GraphState.State) {
      return retryWithBackoff(async () => {
        const prompt = ChatPromptTemplate.fromMessages([
          [
            "system",
            `You are an expert E-commerce Assistant.

              IMPORTANT INSTRUCTIONS:
              1. You have access to the \`item_lookup\` tool, which performs vector search across our product inventory.
              2. ALWAYS invoke the \`item_lookup\` tool whenever a customer inquires about specific products, categories, compatibility, stock, or pricing—even if previous queries yielded errors or empty results.

              TOOL HANDLING GUIDELINES:
              - **Valid Results:** Present product details clearly, including price, compatibility/brand, rating, stock availability, and any available discount.
              - **No Results / Empty Matches:** Politely inform the user that no matching parts were found and offer to assist with alternative parts or categories.
              - **Error / Unresponsive Index:** Acknowledge the technical issue gracefully and inform the user that inventory indexing may be temporarily updating.

              Current time: {time}`,
          ],
          new MessagesPlaceholder("messages"),
        ]);

        const formattedPrompt = await prompt.formatMessages({
          time: new Date().toISOString(),
          messages: state.messages,
        });

        const result = await model.invoke(formattedPrompt);
        return { messages: [result] };
      });
    }

    // ReACT architecture for Agent to decide when to call tools and when to respond to user.
    const workflow = new StateGraph(GraphState)
      .addNode("agent", callModel)
      .addNode("tools", toolNode)
      .addEdge("__start__", "agent")
      .addConditionalEdges("agent", shouldContinue)
      .addEdge("tools", "agent");

    // Saves the state of the conversation to MongoDB, so that the agent can pick up where it left off in future interactions.
    const checkpointer = new MongoDBSaver({ client, dbName });
    const app = workflow.compile({ checkpointer });

    const finalState = await app.invoke(
      {
        messages: [new HumanMessage(query)],
      },
      {
        // Recursion limit is set to 15, which means the agent can call tools and generate responses up to 15 times in a single conversation thread. This prevents infinite loops and ensures that the conversation remains manageable.
        recursionLimit: 15,
        configurable: { thread_id: thread_id },
      },
    );

    const response =
      finalState.messages[finalState.messages.length - 1].content;
    console.log("Agent response:", response);

    return response;
  } catch (error: any) {
    console.error("Error in callAgent:", error.message);

    if (error.status === 429) {
      throw new Error(
        "Service temporarily unavailable due to rate limits. Please try again in a minute.",
      );
    } else if (error.status === 401) {
      throw new Error(
        "Authentication failed. Please check your API configuration.",
      );
    } else {
      throw new Error(`Agent failed: ${error.message}`);
    }
  }
}
