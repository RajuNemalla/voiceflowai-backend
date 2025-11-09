// VoiceFlowAI — Step 1: Base Express Server

import { parseIntent } from "./ai.js";
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
app.post("/api/command", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "text required" });

  const intent = await parseIntent(text);

  // Handle "create_reminder"
  if (intent.action === "create_reminder") {
    if (!remindersCollection)
      return res.json({ success: true, intent, note: "DB not ready" });

    const doc = {
      userId: "anon",
      text: intent.params.text || text,
      when: intent.params.when || new Date().toISOString(),
      createdAt: new Date(),
      status: "pending"
    };
    const r = await remindersCollection.insertOne(doc);
    return res.json({ success: true, id: r.insertedId, intent });
  }

  res.json({ success: false, intent });
});

// Crypto price & Summarizer actions
import fetch from "node-fetch";

// Get crypto price
app.post("/api/crypto", async (req, res) => {
  const { symbol = "bitcoin" } = req.body;
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`);
    const data = await r.json();
    res.json({ success: true, symbol, usd: data[symbol]?.usd });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Summarize URL
app.post("/api/summarize", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return res.status(400).json({ error: "OpenAI key missing" });

  try {
    const prompt = `Summarize the key points from this page: ${url}`;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 250
      })
    });

    const data = await response.json();
    const summary = data?.choices?.[0]?.message?.content || "No summary available.";
    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
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
