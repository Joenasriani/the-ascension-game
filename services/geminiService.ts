import { GoogleGenAI } from "@google/genai";

// Initialize the client
// IMPORTANT: In a real production app, this should be proxied through a backend to hide the key.
// For this specific requested structure, we use the env var directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateReflection = async (levelId: number, theme: string): Promise<string> => {
  try {
    const prompt = `
      I have just completed Level ${levelId} of a puzzle game called Ascension.
      The visual theme was "${theme}".
      The game is about perspective, impossible geometry, and finding paths where none seem to exist.
      
      Generate a short, mystical, and philosophical reflection (maximum 2 sentences) 
      that rewards the player. It should sound like a zen koan or a whisper from a spirit.
      Do not be overly congratulatory ("Good job!"), be atmospheric.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Low latency preferred for UI feedback
      }
    });

    return response.text || "The path reveals itself only to those who walk it.";
  } catch (error) {
    console.error("Gemini Reflection Error:", error);
    return "Silence is also an answer. (Network Error)";
  }
};
