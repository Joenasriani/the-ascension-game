import { LEVELS, THEMES } from "../constants";
import { BlockType, type LevelData } from "../types";
// Separate co-located lift landings, translating the remainder of the path with them.
const repaired = LEVELS.map((level) => {
  const blocks = structuredClone(level.blocks);
  for (let i = 0; i < blocks.length; i++) {
    const lift = blocks[i];
    if (!lift.isSlideable) continue;
    const landing = blocks.find(
      (b) =>
        lift.links.includes(b.id) &&
        b.position.x === lift.position.x &&
        b.position.z === lift.position.z &&
        b.position.y === lift.position.y + 2,
    );
    if (!landing) continue;
    const tail = new Set<string>();
    const queue = [landing.id];
    while (queue.length) {
      const id = queue.shift()!;
      if (id === lift.id || tail.has(id)) continue;
      tail.add(id);
      queue.push(...blocks.find((b) => b.id === id)!.links);
    }
    const onward = blocks.find(
      (b) => landing.links.includes(b.id) && b.id !== lift.id,
    );
    const offset = onward && onward.position.x < landing.position.x ? -1 : 1;
    for (const b of blocks) if (tail.has(b.id)) b.position.x += offset;
  }
  return {
    ...level,
    hint: level.hint.replace(/Red Handle/g, "ivory crank"),
    blocks,
    chapter:
      level.id < 7
        ? "I / Foundations"
        : level.id < 15
          ? "II / Counterweights"
          : "III / The long climb",
  };
});
const w = (id: string, x: number, y: number, z: number, links: string[]) => ({
  id,
  type: BlockType.WALKABLE,
  position: { x, y, z },
  links,
});
const lift = (
  id: string,
  x: number,
  y: number,
  z: number,
  links: string[],
) => ({
  ...w(id, x, y, z, links),
  type: BlockType.SLIDER,
  isSlideable: true,
  sliderVal: 0,
});
export const GAME_LEVELS: LevelData[] = [
  ...repaired,
  {
    id: 24,
    title: "Two places, one edge",
    hint: "Change the view. Distance is not always separation.",
    chapter: "IV / Perspective",
    theme: THEMES[1],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      w("start", 0, 0, 0, []),
      w("far", 3, 3 * Math.SQRT2, 3, ["end"]),
      w("end", 4, 3 * Math.SQRT2, 3, ["far"]),
    ],
    perspectiveLinks: [{ from: "start", to: "far", view: 0 }],
    hints: [
      "Look for two surfaces sharing a silhouette.",
      "Frame I aligns the two distant platforms.",
      "At Frame I, cross to far, then walk to end.",
    ],
  },
  {
    id: 25,
    title: "A change of address",
    hint: "Carry your height into a new view.",
    chapter: "IV / Perspective",
    theme: THEMES[4],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      w("start", -1, 0, 0, ["lift"]),
      lift("lift", 0, 0, 0, ["start"]),
      w("far", 3, 2 + 3 * Math.SQRT2, -3, ["end"]),
      w("end", 4, 2 + 3 * Math.SQRT2, -3, ["far"]),
    ],
    perspectiveLinks: [{ from: "lift", to: "far", view: 1 }],
    hints: [
      "The lift changes more than your elevation.",
      "Ride the lift up and inspect Frame II.",
      "Walk onto lift, raise it, choose Frame II, cross to far, then end.",
    ],
  },
  {
    id: 26,
    title: "The return above",
    hint: "A second reading reveals the summit.",
    chapter: "IV / Perspective",
    theme: THEMES[2],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      w("start", 0, 0, 0, []),
      w("middle", 3, 3 * Math.SQRT2, 3, ["lift"]),
      lift("lift", 4, 3 * Math.SQRT2, 3, ["middle"]),
      w("end", 1, 2 + 6 * Math.SQRT2, 0, []),
    ],
    perspectiveLinks: [
      { from: "start", to: "middle", view: 0 },
      { from: "lift", to: "end", view: 2 },
    ],
    hints: [
      "This ascent needs two different readings.",
      "Frame I begins the route. The raised lift belongs to Frame III.",
      "At Frame I cross to middle, walk to lift, raise it, change to Frame III, cross to end.",
    ],
  },
];
