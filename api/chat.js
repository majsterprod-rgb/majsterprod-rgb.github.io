export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;

  try {
    const reply = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await reply.json();
    const botMessage = data.choices?.[0]?.message?.content || "Brak odpowiedzi.";

    res.status(200).json({ reply: botMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
