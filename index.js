// VoiceFlowAI — Step 1: Base Express Server
import express from "express";
import cors from "cors";

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

// Placeholder endpoint for commands
app.post("/api/command", (req, res) => {
  const { text } = req.body;
  res.json({ success: true, message: `You said: ${text || "nothing"}` });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ VoiceFlowAI running on port ${PORT}`));
