export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { message } = req.body;

  try {
    const reply = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: message
      }),
    });

    const data = await reply.json();

    // nowy format: output[0].content[0].text
    const botMessage =
      data.output?.[0]?.content?.[0]?.text || "Brak odpowiedzi.";

    res.status(200).json({ reply: botMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
