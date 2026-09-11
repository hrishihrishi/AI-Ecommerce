import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// Define schema for Product structure to match backend/models.py Product
const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  brand: z.string(),
  price: z.number(),
  discount_price: z.number().optional(),
  image: z.string(),
  stock: z.number().int(),
  rating: z.number(),
  reviews_count: z.number().int(),
  reviews: z
    .array(
      z.object({
        user_id: z.string(),
        user_name: z.string(),
        rating: z.number().int(),
        comment: z.string(),
        created_at: z.string(),
      }),
    )
    .optional(),
  created_at: z.string().optional(),
});

// Create TypeScript type from Zod schema for type safety
type Item = z.infer<typeof itemSchema>;

// Create parser that ensures AI output matches our Product schema
const parser = StructuredOutputParser.fromZodSchema(z.array(itemSchema));

// Function to create database and collection before seeding
async function setupDatabaseAndCollection(): Promise<void> {
  console.log("Setting up database and collection...");
  const db = client.db("inventory_database");
  const collections = await db.listCollections({ name: "items" }).toArray();

  if (collections.length === 0) {
    await db.createCollection("items");
    console.log("Created 'items' collection in 'inventory_database' database");
  } else {
    console.log(
      "'items' collection already exists in 'inventory_database' database",
    );
  }
}

// Function to create vector search index [KNOW MORE]
async function createVectorSearchIndex(): Promise<void> {
  try {
    const db = client.db("inventory_database");
    const collection = db.collection("items");
    await collection.dropIndexes();
    const vectorSearchIdx = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 768,
            similarity: "cosine",
          },
        ],
      },
    };
    console.log("Creating vector search index...");
    await collection.createSearchIndex(vectorSearchIdx);

    console.log("Successfully created vector search index");
  } catch (e) {
    console.error("Failed to create vector search index:", e);
  }
}

async function generateSyntheticData(): Promise<Item[]> {
  // Create detailed prompt instructing AI to generate furniture store data
  const prompt = `You are a helpful assistant that generates e-commerce product data that conforms to our backend Product schema. Generate 10 product items. Each record should include the following fields: id, name, description, category, brand, price, discount_price (optional), image, stock, rating, reviews_count, reviews (optional array of {user_id, user_name, rating, comment, created_at}), created_at (ISO string). Ensure variety in the data and realistic values.

  ${parser.getFormatInstructions()}`; // Add format instructions from parser

  // Log progress to console
  console.log("Generating synthetic data...");

  // Send prompt to AI and get response
  const response = await llm.invoke(prompt);
  // Parse AI response into structured array of Item objects
  return parser.parse(response.content as string);
}

// Function to create a searchable text summary from furniture item data
async function createItemSummary(item: Item): Promise<string> {
  // Return Promise for async compatibility (though this function is synchronous)
  return new Promise((resolve) => {
    const categories = item.category;
    // Convert reviews array into readable text format
    const userReviews = (item.reviews || [])
      .map(
        (review) =>
          `Rated ${review.rating} by ${review.user_name} on ${review.created_at}: ${review.comment}`,
      )
      .join(" ");
    const basicInfo = `${item.name} ${item.description} from the brand ${item.brand}`;
    const price = `Price: ${item.price} USD${item.discount_price ? `, Discount: ${item.discount_price} USD` : ""}`;

    const summary = `${basicInfo}. Category: ${categories}. Reviews: ${userReviews}. ${price}`;

    // Resolve promise with complete summary
    resolve(summary);
  });
}

// Main function to populate database with AI-generated furniture data
async function seedDatabase(): Promise<void> {
  try {
    // Establish connection to MongoDB Atlas
    await client.connect();
    // Ping database to verify connection works
    await client.db("admin").command({ ping: 1 });
    // Log successful connection
    console.log("You successfully connected to MongoDB!");

    // Setup database and collection
    await setupDatabaseAndCollection();

    // Create vector search index
    await createVectorSearchIndex();

    // Get reference to specific database
    const db = client.db("inventory_database");
    // Get reference to items collection
    const collection = db.collection("items");

    // Clear existing data from collection (fresh start)
    await collection.deleteMany({});
    console.log("Cleared existing data from items collection");

    // Generate new synthetic furniture data using AI
    const syntheticData = await generateSyntheticData();

    // Process each item: create summary and prepare for vector storage
    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createItemSummary(record), // Create searchable summary
        metadata: { ...record }, // Preserve original item data
      })),
    );

    // Store each record with vector embeddings in MongoDB
    for (const record of recordsWithSummaries) {
      // Create vector embeddings and store in MongoDB Atlas using Gemini
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record], // Array containing single record
        new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_API_KEY,
          modelName: "text-embedding-004",
        }),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        },
      );

      console.log("Successfully processed & saved record:", record.metadata.id);
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

// Execute the database seeding function and handle any errors
seedDatabase().catch(console.error);
