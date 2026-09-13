export interface Progress {
  unlocked: number;
  completed: number[];
  best: Record<string, number>;
}
export const EMPTY: Progress = { unlocked: 0, completed: [], best: {} };
const KEY = "ascension.v2.progress";
export function readProgress(total: number): Progress {
  try {
    const x = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!x || !Number.isInteger(x.unlocked) || x.unlocked < 0)
      return { ...EMPTY };
    return {
      unlocked: Math.min(x.unlocked, total - 1),
      completed: Array.isArray(x.completed)
        ? x.completed.filter(
            (i: unknown) =>
              Number.isInteger(i) && Number(i) >= 0 && Number(i) < total,
          )
        : [],
      best:
        typeof x.best === "object" && x.best
          ? (Object.fromEntries(
              Object.entries(x.best).filter(
                ([, v]) =>
                  typeof v === "number" && Number.isFinite(v) && v >= 0,
              ),
            ) as Record<string, number>)
          : {},
    };
  } catch {
    return { ...EMPTY };
  }
}
export function saveProgress(x: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(x));
    return true;
  } catch {
    return false;
  }
}
