const REFLECTIONS = [
  "The path reveals itself only to those who walk it.",
  "What seems like a wall may be a step viewed from another angle.",
  "To rise, one must sometimes descend.",
  "Perspective changes the architecture of the path.",
  "When the route disappears, rotate the question.",
  "The obstacle and the path can occupy the same space.",
  "A turn in the world can become a turn in understanding.",
  "Look for the connection that only perspective can reveal.",
];

export const generateReflection = async (levelId: number, theme: string): Promise<string> => {
  const index = Math.abs((levelId * 31 + theme.length * 17) % REFLECTIONS.length);
  return REFLECTIONS[index];
};
