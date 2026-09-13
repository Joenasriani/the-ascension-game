import {
  BlockType,
  type BlockData,
  type LevelData,
  type Vector3,
} from "../types";
export type Action =
  | { type: "walk" | "operate"; id: string }
  | { type: "view"; view: number };
export interface Snapshot {
  player: string;
  blocks: BlockData[];
  view: number;
  moves: number;
}
export const initialState = (l: LevelData): Snapshot => ({
  player: l.startBlockId,
  blocks: structuredClone(l.blocks),
  view: l.perspectiveLinks ? 3 : 0,
  moves: 0,
});
export const position = (b: BlockData): Vector3 => ({
  ...b.position,
  y: b.position.y + (b.isSlideable ? (b.sliderVal ?? 0) * 2 : 0),
});
export const dimensions = (b: BlockData): Vector3 => {
  const s = b.size ?? { x: 1, y: 1, z: 1 };
  return b.type === BlockType.ROTATOR && (b.rotation ?? 0) % 2 !== 0
    ? { x: s.z, y: s.y, z: s.x }
    : s;
};
export function aligned(a: BlockData, b: BlockData) {
  const p = position(a),
    q = position(b),
    s = dimensions(a),
    t = dimensions(b);
  if (Math.abs(p.y + s.y / 2 - q.y - t.y / 2) > 0.05) return false;
  const dx = Math.abs(p.x - q.x),
    dz = Math.abs(p.z - q.z);
  return (
    (dx <= (s.x + t.x) / 2 + 0.02 && dz < (s.z + t.z) / 2 - 0.05) ||
    (dz <= (s.z + t.z) / 2 + 0.02 && dx < (s.x + t.x) / 2 - 0.05)
  );
}
export function projected(p: Vector3, view: number) {
  const a = Math.PI / 4 + (view * Math.PI) / 2;
  return {
    x: p.x * Math.cos(a) - p.z * Math.sin(a),
    y: (p.y - p.x * Math.sin(a) - p.z * Math.cos(a)) / Math.SQRT2,
  };
}
export function perspectiveConnected(
  l: LevelData,
  s: Snapshot,
  from: string,
  to: string,
) {
  const link = l.perspectiveLinks?.find(
    (p) =>
      p.view === s.view &&
      ((p.from === from && p.to === to) || (p.from === to && p.to === from)),
  );
  if (!link) return false;
  const a = s.blocks.find((b) => b.id === from),
    b = s.blocks.find((b) => b.id === to);
  if (!a || !b) return false;
  const p = projected(position(a), s.view),
    q = projected(position(b), s.view);
  return Math.hypot(p.x - q.x, p.y - q.y) < 0.06;
}
export function canWalk(l: LevelData, s: Snapshot, id: string) {
  if (id === s.player) return false;
  const a = s.blocks.find((b) => b.id === s.player),
    b = s.blocks.find((b) => b.id === id);
  if (!a || !b || b.type === BlockType.EMPTY) return false;
  return (
    ((a.links.includes(id) || b.links.includes(a.id)) && aligned(a, b)) ||
    perspectiveConnected(l, s, a.id, id)
  );
}
export function transition(
  l: LevelData,
  s: Snapshot,
  a: Action,
): Snapshot | null {
  if (a.type === "view")
    return a.view !== s.view
      ? { ...s, view: ((a.view % 4) + 4) % 4, moves: s.moves + 1 }
      : null;
  if (a.type === "walk")
    return canWalk(l, s, a.id)
      ? { ...s, player: a.id, moves: s.moves + 1 }
      : null;
  const b = s.blocks.find((b) => b.id === a.id);
  if (!b || (!b.isRotatable && !b.isSlideable)) return null;
  return {
    ...s,
    moves: s.moves + 1,
    blocks: s.blocks.map((x) =>
      x.id !== a.id
        ? x
        : {
            ...x,
            ...(x.isRotatable
              ? { rotation: ((x.rotation ?? 0) + 1) % 4 }
              : { sliderVal: 1 - (x.sliderVal ?? 0) }),
          },
    ),
  };
}
export const actions = (l: LevelData, s: Snapshot): Action[] => [
  ...s.blocks
    .filter((b) => canWalk(l, s, b.id))
    .map((b) => ({ type: "walk" as const, id: b.id })),
  ...s.blocks
    .filter((b) => b.isRotatable || b.isSlideable)
    .map((b) => ({ type: "operate" as const, id: b.id })),
  ...(l.perspectiveLinks
    ? [0, 1, 2, 3]
        .filter((v) => v !== s.view)
        .map((view) => ({ type: "view" as const, view }))
    : []),
];
export function solve(l: LevelData, start = initialState(l)): Action[] | null {
  const key = (s: Snapshot) =>
    [
      s.player,
      s.view,
      ...s.blocks.map((b) =>
        b.isRotatable ? (b.rotation ?? 0) % 2 : (b.sliderVal ?? 0),
      ),
    ].join("|");
  const queue: [Snapshot, Action[]][] = [[start, []]];
  const seen = new Set([key(start)]);
  for (let i = 0; i < queue.length && i < 50000; i++) {
    const [s, path] = queue[i];
    if (s.player === l.endBlockId) return path;
    for (const a of actions(l, s)) {
      const next = transition(l, s, a)!;
      const k = key(next);
      if (!seen.has(k)) {
        seen.add(k);
        queue.push([next, [...path, a]]);
      }
    }
  }
  return null;
}
