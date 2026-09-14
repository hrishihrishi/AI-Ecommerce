/**
 * Holds endpoints: /, /chat, /chat/:threadId
 * No langraph here yet
 */

import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import { MongoClient } from "mongodb";
import { callAgent } from "./agent.ts";
import cors from "cors";

const app: Express = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_ATLAS_URI as string | undefined;
if (!mongoUri) {
  console.error(
    "Missing MONGODB_ATLAS_URI in environment. Create next-frontend/server/.env with MONGODB_ATLAS_URI and GOOGLE_API_KEY.",
  );
  process.exit(1);
}
const dbClient = new MongoClient(mongoUri);

async function startServer() {
  try {
    await dbClient.connect();
    await dbClient.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    app.get("/", (req: Request, res: Response) => {
      res.send("LangGraph Agent Server (integrated in next-frontend)");
    });

    app.post("/chat", async (req: Request, res: Response) => {
      const initialMessage = req.body.message;
      const threadId = Date.now().toString();
      try {
        const response = await callAgent(dbClient, initialMessage, threadId);
        res.json({ threadId, response });
      } catch (error) {
        console.error("Error starting conversation:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    app.post("/chat/:threadId", async (req: Request, res: Response) => {
      const { threadId } = req.params;
      const { message } = req.body;
      try {
        const response = await callAgent(dbClient, message, threadId);
        res.json({ response });
      } catch (error) {
        console.error("Error in chat:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    const PORT = process.env.PORT || 8005;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

startServer();
