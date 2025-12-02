// api/chat.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing message" });

  try {
    // debug: pokaż w logach tylko czy klucz istnieje (nie pokazuj wartości)
    console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: message }
        ],
        // opcjonalnie: max_tokens, temperature itp.
        // max_tokens: 500,
        // temperature: 0.7
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("OpenAI non-OK response:", resp.status, text);
      return res.status(502).json({ error: "OpenAI error", details: text });
    }

    const data = await resp.json();

    const botMessage = data.choices?.[0]?.message?.content || "Brak odpowiedzi.";

    return res.status(200).json({ reply: botMessage });
  } catch (error) {
    console.error("Chat handler error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
