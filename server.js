import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(cors());

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    const completion = await client.responses.create({
      model: "gpt-4.1-mini",
      input: userMessage
    });

    const reply = completion.output[0].content[0].text;

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ reply: "Error: server failed." });
  }
});

// ❗ ZAMIAST app.listen — EXPORTUJEMY!!
export default app;
