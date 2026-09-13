import { test } from "node:test";
import assert from "node:assert/strict";
import { GAME_LEVELS } from "../game/levels";
import {
  initialState,
  transition,
  solve,
  aligned,
  position,
  perspectiveConnected,
  dimensions,
} from "../game/engine";
for (const level of GAME_LEVELS)
  test(`Level ${level.id}: valid graph, solvable, safe endpoints`, () => {
    const ids = new Set(level.blocks.map((b) => b.id));
    assert.equal(ids.size, level.blocks.length);
    assert(ids.has(level.startBlockId) && ids.has(level.endBlockId));
    for (const b of level.blocks) for (const id of b.links) assert(ids.has(id));
    const solution = solve(level);
    assert(solution, `${level.title} unsolvable`);
    let s = initialState(level);
    const original = JSON.stringify(s);
    assert.equal(transition(level, s, { type: "walk", id: "missing" }), null);
    assert.equal(JSON.stringify(s), original);
    for (const action of solution) s = transition(level, s, action)!;
    assert.equal(s.player, level.endBlockId);
    assert.equal(s.moves, solution.length);
  });
test("Changing camera alone cannot move player", () => {
  const l = GAME_LEVELS[23],
    s = initialState(l),
    next = transition(l, s, { type: "view", view: 0 })!;
  assert.equal(next.player, s.player);
  assert(perspectiveConnected(l, next, "start", "far"));
  assert(!perspectiveConnected(l, s, "start", "far"));
});
test("Perspective route requires elevation and correct frame", () => {
  const l = GAME_LEVELS[24];
  let s = initialState(l);
  s = transition(l, s, { type: "view", view: 1 })!;
  assert(!perspectiveConnected(l, s, "lift", "far"));
  s = transition(l, s, { type: "operate", id: "lift" })!;
  assert(perspectiveConnected(l, s, "lift", "far"));
});
test("Every migrated lift landing has distinct geometry", () => {
  for (const l of GAME_LEVELS)
    for (const b of l.blocks.filter((b) => b.isSlideable)) {
      const p = position({ ...b, sliderVal: 1 });
      for (const other of l.blocks.filter(
        (o) => o.id !== b.id && o.type !== "EMPTY",
      )) {
        const q = position(other);
        assert(
          Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z) > 0.05,
          `${l.id}/${b.id} overlaps ${other.id}`,
        );
      }
    }
});
test("Touching corners alone are not a walking connection", () => {
  const a = { ...GAME_LEVELS[0].blocks[0], position: { x: 0, y: 0, z: 0 } },
    b = { ...a, position: { x: 1, y: 0, z: 1 } };
  assert(!aligned(a, b));
});
test("Four rotations restore geometry and never mutate snapshots", () => {
  const l = GAME_LEVELS[0];
  let s = initialState(l);
  const frozen = JSON.stringify(s);
  for (let i = 0; i < 4; i++)
    s = transition(l, s, { type: "operate", id: "bridge" })!;
  assert.equal(s.blocks[1].rotation, l.blocks[1].rotation);
  assert.equal(JSON.stringify(initialState(l)), frozen);
});
test("No traversable solids intersect in any discrete mechanism configuration", () => {
  for (const l of GAME_LEVELS) {
    const bs = l.blocks.filter((b) => b.type !== "EMPTY");
    for (let i = 0; i < bs.length; i++)
      for (let j = i + 1; j < bs.length; j++)
        for (const ra of bs[i].isRotatable ? [0, 1] : [0])
          for (const rb of bs[j].isRotatable ? [0, 1] : [0])
            for (const sa of bs[i].isSlideable ? [0, 1] : [0])
              for (const sb of bs[j].isSlideable ? [0, 1] : [0]) {
                const a = { ...bs[i], rotation: ra, sliderVal: sa },
                  b = { ...bs[j], rotation: rb, sliderVal: sb },
                  p = position(a),
                  q = position(b),
                  s = dimensions(a),
                  t = dimensions(b);
                assert(
                  !(["x", "y", "z"] as const).every(
                    (k) => Math.abs(p[k] - q[k]) < (s[k] + t[k]) / 2 - 0.03,
                  ),
                  `Level ${l.id}: ${a.id} intersects ${b.id}`,
                );
              }
  }
});
