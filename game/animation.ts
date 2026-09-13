import type { BlockData } from "../types";
import { position } from "./engine";
export const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export function blockPose(from: BlockData, to: BlockData, t: number) {
  const a = position(from),
    b = position(to),
    start = ((from.rotation ?? 0) * Math.PI) / 2;
  let end = ((to.rotation ?? 0) * Math.PI) / 2;
  if (end < start) end += Math.PI * 2;
  const turning = start !== end;
  const phase = turning
    ? t < 0.2
      ? ease(t / 0.2)
      : t > 0.8
        ? ease((1 - t) / 0.2)
        : 1
    : 0;
  // Retract before turning, then extend. Raising a full-height slab can strike the floor above.
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
    angle:
      start +
      (end - start) *
        (turning ? ease(Math.max(0, Math.min(1, (t - 0.2) / 0.6))) : t),
    scale: 1 - 0.12 * phase,
  };
}
