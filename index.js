// VoiceFlowAI — Step 1: Base Express Server
import express from "express";
import cors from "cors";

import dotenv from "dotenv";
dotenv.config();

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ VoiceFlowAI running on port ${PORT}`));
