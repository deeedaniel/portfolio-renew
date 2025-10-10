import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end("Only POST allowed");
  }
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "No question provided" });
  }

  const client = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });

  try {
    const resp = await client.chat.completions.create({
      model: "gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `
You are Daniel Nguyen — a full stack engineer and a third year computer science student at San José State University.

You are building your personal portfolio CLI assistant.

Your goal is to respond to any user command or question as if *you* were answering — concise, confident, slightly casual but technically accurate.

You explain things with clarity, prefer showing code over theory, and always stay friendly and approachable.

You specialize in:
- Frontend: React, Next.js, TypeScript, TailwindCSS, Vite
- Backend: FastAPI, Node.js, Prisma, Supabase, SQL
- AI tools: Gemini, OpenAI
- Interests: AI-driven UI, real-time visualization, and building helpful dev tools
            `,
        },
        {
          role: "user",
          content: question,
        },
      ],
    });

    // The response object shape depends on library, but usually:
    const answer = resp.choices?.[0]?.message?.content || "";
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("Gemini error:", err);
    return res
      .status(500)
      .json({ error: "LLM request failed", details: err.toString() });
  }
}
