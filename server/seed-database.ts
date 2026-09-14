/**
 * TODO: Configure zod schema according to backend/models.py Product model to ensure AI output matches the schema.
 * TODO: Update the prompt in generateSyntheticData() function.
 */

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from "@langchain/google-genai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config";
import { id } from "zod/v4/locales";

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string);

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  temperature: 0.7,
  apiKey: process.env.GOOGLE_API_KEY,
});

// // Define schema for Product structure to match backend/models.py Product
// const itemSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   description: z.string(),
//   category: z.string(),
//   brand: z.string(),
//   price: z.number(),
//   discount_price: z.number().optional(),
//   image: z.string(),
//   stock: z.number().int(),
//   rating: z.number(),
//   reviews_count: z.number().int(),
//   reviews: z
//     .array(
//       z.object({
//         user_id: z.string(),
//         user_name: z.string(),
//         rating: z.number().int(),
//         comment: z.string(),
//         created_at: z.string(),
//       }),
//     )
//     .optional(),
//   created_at: z.string().optional(),
// });

// // Create TypeScript type from Zod schema for type safety
// type Item = z.infer<typeof itemSchema>;

// // Create parser that ensures AI output matches our Product schema
// const parser = StructuredOutputParser.fromZodSchema(z.array(itemSchema));

// TODO: check ProductDetailsSchema
// Check Zod schema matching ProductCreate Pydantic model
const ProductDetailsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  brand: z.string(),
  price: z.number().positive(),
  discount_price: z.number().positive().optional(),
  image: z.string().url(),
  stock: z.number().int().nonnegative().default(0),
});

// TypeScript type inference
type ProductDetails = z.infer<typeof ProductDetailsSchema>;

// Parser setup for structured output
const parser = StructuredOutputParser.fromZodSchema(
  z.array(ProductDetailsSchema),
);

// Zod schema matching fetched product documents
const Fetched_ProductDetailsSchema = z.object({
  _id: z.union([z.string(), z.object({}).passthrough()]).optional(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  brand: z.string(),
  price: z.number().positive(),
  discount_price: z.number().positive().optional(),
  image: z.string().url(),
  stock: z.number().int().nonnegative().default(0),
  rating: z.number().min(0).max(5),
  reviews_count: z.number().int().nonnegative().default(0),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => new Date(val).toISOString())
    .optional(),
});

// TypeScript type inference
type FetchedProductDetails = z.infer<typeof Fetched_ProductDetailsSchema>;

// Parser setup for structured output
const fetched_parser = StructuredOutputParser.fromZodSchema(
  z.array(Fetched_ProductDetailsSchema),
);

// Single source of truth for AI
// Will contains summary of products, brands, categories, reviews etc. to help AI answer questions about the inventory
// Function to create database and collection before seeding
async function setupDatabaseAndCollection(): Promise<void> {
  console.log("Setting up database and collection...");
  // const db = client.db("inventory_database");
  const db = client.db("vector_database");
  const collections = await db
    .listCollections({ name: "itemsWsummary" })
    .toArray();

  if (collections.length === 0) {
    await db.createCollection("itemsWsummary");
    console.log(
      "Created 'itemsWsummary' collection in 'vector_database' database",
    );
  } else {
    console.log(
      "'itemsWsummary' collection already exists in 'vector_database' database",
    );
  }
}

// Creates a vector search index on the 'itemsWsummary' collection in the 'vector_database' database.
// configure and define vector dimensions and enable fuzzy search
async function createVectorSearchIndex(): Promise<void> {
  try {
    // const db = client.db("inventory_database");
    const db = client.db("vector_database");
    const collection = db.collection("itemsWsummary");
    await collection.dropIndexes();
    const vectorSearchIdx = {
      name: "vector_index",
      type: "vectorSearch",
      definition: {
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 3072,
            similarity: "cosine",
          },
        ],
      },
    };
    console.log("Creating vector search index...");

    // this allows fuzzy search of vectors
    await collection.createSearchIndex(vectorSearchIdx);

    console.log("Successfully created vector search index");
  } catch (e) {
    console.error("Failed to create vector search index:", e);
  }
}

//  @returns parsed synthetic data in defined zod schema
// Modify this function when schema changes in backend/models.py Product model to ensure AI output matches the schema
async function generateSyntheticData(): Promise<ProductDetails[]> {
  // Create detailed prompt instructing AI to generate furniture store data
  const prompt = `You are a helpful assistant that generates e-commerce product data matching our exact database schema. Generate 10 realistic, diverse product items.

                                              Each record must conform to the following format and field structure:
                                              - id: String (, e.g., "prod-1")
                                              - name: String
                                              - description: String
                                              - category: String (e.g., "Display & Screens", "Batteries", etc.)
                                              - brand: String
                                              - price: Number (e.g., 8999)
                                              - discount_price: Number or null/omitted
                                              - image: String (valid URL)
                                              - stock: Integer (e.g., 25)
                                              Example target format:
                                              {
                                                "id": "prod-1",
                                                "name": "LCD with Touch Screen for Samsung Galaxy S21",
                                                "description": "Original quality AMOLED display with touch digitizer for Samsung Galaxy S21. Perfect replacement for broken or damaged screens.",
                                                "category": "Display & Screens",
                                                "brand": "Samsung",
                                                "price": 8999,
                                                "discount_price": 7499,
                                                "image": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500",
                                                "stock": 25
                                              }

                                              Ensure variety in name, brands, categories, prices, and realistic values across all 10 items.
                                                ${parser.getFormatInstructions()}`; // Add format instructions to the prompt. from parser.

  console.log("Generating synthetic data...");
  // Send prompt to AI and get response
  const response = await llm.invoke(prompt);

  // Parse AI response into structured array of Item objects
  return parser.parse(response.content as string);
}

// Fetch all product details from main product collection in the database combines into a single array of product details
async function fetchProductDetails(): Promise<FetchedProductDetails[]> {
  try {
    console.log("Fetching product details from database...");
    const db = client.db("test_database");
    const itemsCollection = db.collection("products");

    const docs = await itemsCollection.find({}).toArray();

    if (docs.length === 0) {
      console.warn("No product details found in the database.");
      return [];
    }

    console.log(`Fetched ${docs.length} product details from the database.`);

    const normalizedDocs = docs.map((doc) => ({
      ...doc,
      _id: doc._id?.toString(),
    }));

    return z.array(Fetched_ProductDetailsSchema).parse(normalizedDocs);
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
}

// Function to create a searchable text summary from product item data matching backend schema.
// @param item - The Product object to create a summary for.
// @returns A Promise that resolves to a string summary of the item.
async function createItemSummary(
  item: FetchedProductDetails | ProductDetails,
): Promise<string> {
  const rating = "rating" in item ? item.rating : 0;
  const reviewsCount = "reviews_count" in item ? item.reviews_count : 0;

  const basicInfo = `${item.name}. ${item.description}. Brand: ${item.brand}`;
  const priceInfo = `Price: ₹${item.price}${
    item.discount_price ? `, Discount Price: ₹${item.discount_price}` : ""
  }`;
  const metrics = `Rating: ${rating}/5 from ${reviewsCount} reviews. Stock available: ${item.stock}`;

  return `${basicInfo}. Category: ${item.category}. ${priceInfo}. ${metrics}.`;
}

// Sets up Mongodb DB
// creates vector search
// clears db
// generates synthetic data
// creates summary for each record of sythetic data
// appends the original item data as metadata for future reference
// stores each record with vector embeddings in MongoDB
// Main function to populate database with AI-generated furniture data
async function seedDatabase(): Promise<void> {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    await setupDatabaseAndCollection();

    // Create vector search index
    await createVectorSearchIndex();

    const db = client.db("vector_database");
    // Get reference to items collection
    const collection = db.collection("itemsWsummary");

    // Clear existing data from collection (fresh start)
    await collection.deleteMany({});
    console.log("Cleared existing data from items collection");

    // const syntheticData = await generateSyntheticData();
    const syntheticData = await fetchProductDetails();

    // Process each item: create summary for each record of sythetic data and append the original item data as metadata for future reference
    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createItemSummary(record), // Create searchable summary
        metadata: { ...record }, // Preserve original item data
      })),
    );

    // Store each record with vector embeddings in MongoDB [KNOW MORE]
    for (const record of recordsWithSummaries) {
      // helper method from the LangChain to generate embeddings
      // and insert the document into the database in a single step.
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record], // Array containing single record
        new GoogleGenerativeAIEmbeddings({
          apiKey: process.env.GOOGLE_API_KEY,
          modelName: "gemini-embedding-001",
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
