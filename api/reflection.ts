import { GoogleGenAI } from "@google/genai";

type Req = {
  method?: string;
  body?: {
    levelId?: unknown;
    theme?: unknown;
  };
};

type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => unknown;
};

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const levelId = typeof req.body?.levelId === "number" ? req.body.levelId : Number(req.body?.levelId);
  const theme = typeof req.body?.theme === "string" ? req.body.theme.trim() : "";

  if (!Number.isFinite(levelId) || levelId < 1 || !theme || theme.length > 120) {
    return res.status(400).json({ error: "Invalid reflection request" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: "Reflection provider is not configured" });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      I have just completed Level ${levelId} of a puzzle game called Ascension.
      The visual theme was "${theme}".
      The game is about perspective, impossible geometry, and finding paths where none seem to exist.

      Generate a short, mystical, and philosophical reflection (maximum 2 sentences)
      that rewards the player. It should sound like a zen koan or a whisper from a spirit.
      Do not be overly congratulatory ("Good job!"), be atmospheric.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const reflection = response.text?.trim();
    if (!reflection) {
      return res.status(502).json({ error: "Reflection provider returned an empty response" });
    }

    return res.status(200).json({ reflection });
  } catch (error) {
    console.error("Reflection provider failed", error);
    return res.status(502).json({ error: "Reflection provider failed" });
  }
}
