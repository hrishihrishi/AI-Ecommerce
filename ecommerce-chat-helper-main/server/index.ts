import 'dotenv/config'
import express, { Express, Request, Response } from "express"
import { MongoClient } from "mongodb"
// Import our custom AI agent function
import { callAgent } from './agent'
import cors from 'cors'


const app: Express = express()

app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_ATLAS_URI as string)

// Async function to initialize and start the server
async function startServer() {
  try {
    // Establish connection to MongoDB Atlas
    await client.connect()
    await client.db("admin").command({ ping: 1 })
    console.log("You successfully connected to MongoDB!")

    app.get('/', (req: Request, res: Response) => {
      res.send('LangGraph Agent Server')
    })

    // Define endpoint for starting new conversations (POST /chat)
    app.post('/chat', async (req: Request, res: Response) => {
      // Extract user message from request body
      const initialMessage = req.body.message
      const threadId = Date.now().toString()
      console.log(initialMessage)
      try {
        const response = await callAgent(client, initialMessage, threadId)
        // Send successful response with thread ID and AI response
        res.json({ threadId, response })
      } catch (error) {
        console.error('Error starting conversation:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    // Define endpoint for continuing existing conversations (POST /chat/:threadId)
    app.post('/chat/:threadId', async (req: Request, res: Response) => {
      const { threadId } = req.params
      const { message } = req.body
      try {
        // Call AI agent with message and existing thread ID (continues conversation)
        const response = await callAgent(client, message, threadId)
        // Send AI response (no need to send threadId again since it's continuing)
        res.json({ response })
      } catch (error) {
        console.error('Error in chat:', error)
        res.status(500).json({ error: 'Internal server error' })
      }
    })

    const PORT = process.env.PORT || 8000
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    // Exit the process with error code 1 (indicates failure)
    process.exit(1)
  }
}

startServer()