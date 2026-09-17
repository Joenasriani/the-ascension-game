export const generateReflection = async (levelId: number, theme: string): Promise<string> => {
  try {
    const response = await fetch("/api/reflection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ levelId, theme }),
    });

    if (!response.ok) {
      throw new Error(`Reflection request failed (${response.status})`);
    }

    const payload = await response.json() as { reflection?: string };
    return payload.reflection?.trim() || "The path reveals itself only to those who walk it.";
  } catch (error) {
    console.error("Reflection Error:", error);
    return "Silence is also an answer. (Network Error)";
  }
};
