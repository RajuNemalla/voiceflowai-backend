// VoiceFlowAI — Step 1: Base Express Server
import express from "express";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

import { MongoClient } from "mongodb";

let mongoClient;
let remindersCollection;

async function initMongo() {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️ MONGODB_URI not set — skipping DB connection");
    return;
  }

  mongoClient = new MongoClient(process.env.MONGODB_URI);
  await mongoClient.connect();

  const db = mongoClient.db("voiceflowai");
  remindersCollection = db.collection("reminders");
  console.log("✅ MongoDB connected successfully");
}

// Connect Mongo when the server starts
initMongo().catch(err => console.error("❌ Mongo init error:", err));


const MONGODB_URI = process.env.MONGODB_URI;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => res.send("VoiceFlowAI is live 🚀"));

// Simple health endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    time: new Date().toISOString()
  });
});
// 🔧 Step 2 check route — verifies .env variables loaded
app.get("/api/config-check", (req, res) => {
  res.json({
    mongoURI: process.env.MONGODB_URI ? "✅ Loaded" : "❌ Missing",
    openAIKey: process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing"
  });
});

// Placeholder endpoint for commands
app.post("/api/command", (req, res) => {
  const { text } = req.body;
  res.json({ success: true, message: `You said: ${text || "nothing"}` });
});
// Create a new reminder and save to MongoDB
app.post("/api/reminders", async (req, res) => {
  if (!remindersCollection) return res.status(500).json({ error: "DB not ready" });

  const { userId = "guest", text, when } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });

  const reminder = {
    userId,
    text,
    when: when || new Date().toISOString(),
    createdAt: new Date(),
    status: "pending"
  };

  const result = await remindersCollection.insertOne(reminder);
  res.json({ success: true, id: result.insertedId, reminder });
});

// Get all reminders (optionally filter by userId)
app.get("/api/reminders", async (req, res) => {
  if (!remindersCollection) return res.status(500).json({ error: "DB not ready" });

  const { userId } = req.query;
  const filter = userId ? { userId } : {};

  const reminders = await remindersCollection.find(filter).sort({ createdAt: -1 }).toArray();
  res.json({ success: true, count: reminders.length, reminders });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ VoiceFlowAI running on port ${PORT}`));
