# VoiceFlowAI Backend 🤖

An **AI-powered automation backend** built with **Node.js, Express, MongoDB, and OpenAI** — deployed live on **Render**.

## 🌍 Live API
🔗 https://voiceflowai-backend-ifzb.onrender.com

## ⚙️ Features
✅ Natural language command parser (AI intent detection)  
✅ Reminder system (MongoDB Atlas integration)  
✅ Crypto price fetcher (CoinGecko API)  
✅ Smart summarizer (OpenAI GPT integration)  
✅ Fully deployed on Render cloud  

---

## 📡 API Endpoints

| Endpoint | Method | Description |
|-----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/command` | POST | Understands natural-language commands |
| `/api/reminders` | POST | Create reminders |
| `/api/crypto` | POST | Get crypto price (CoinGecko) |
| `/api/summarize` | POST | Summarize web article |

---

## 🧠 Example Usage
```bash
curl -X POST "https://voiceflowai-backend-ifzb.onrender.com/api/command" \
-H "Content-Type: application/json" \
-d '{"text":"Remind me to submit my project at 9pm"}'

RESPONSE
{
  "success": true,
  "intent": {
    "action": "create_reminder",
    "params": {
      "text": "submit my project",
      "when": "21:00"
    }
  }
}


## 👨‍💻 Developer
**Raju Nemalla**  
📧 nemallaraju2001@gmail.com  
🌐 [GitHub Profile](https://github.com/RajuNemalla)
