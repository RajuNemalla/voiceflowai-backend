// ai.js — Step 4: simple intent parser
import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Convert natural text to an intent
export async function parseIntent(text) {
  if (!OPENAI_API_KEY) {
    // fallback rule-based
    if (text.toLowerCase().includes("remind"))
      return { action: "create_reminder", params: { text } };
    return { action: "unknown", params: { text } };
  }

  const prompt = `
  Convert the user's message into a JSON object with fields:
  "action" (e.g. create_reminder, get_crypto_price, summarize_url)
  and "params" (key/value details). 
  Only return valid JSON.

  Example:
  Input: "Remind me to call mom at 6pm"
  Output: {"action":"create_reminder","params":{"text":"call mom","when":"18:00"}}

  Input: "${text}"
  Output:
  `;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200
    })
  });

  const body = await res.json();
  const content = body?.choices?.[0]?.message?.content || "";
  try {
    const start = content.indexOf("{");
    const jsonStr = content.slice(start);
    return JSON.parse(jsonStr);
  } catch {
    return { action: "unknown", params: { text, raw: content } };
  }
}
