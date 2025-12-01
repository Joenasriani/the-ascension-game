import { LevelData, BlockType } from './types';

export const THEMES = {
  1: { bg: "#FFDEE9", fog: "#FFDEE9", stone: "#FFFFFF", accent: "#574b90", path: "#f78fb3", wheel: "#ff6b81" },
  2: { bg: "#f6d365", fog: "#f6d365", stone: "#FFF5C3", accent: "#FF9F43", path: "#1DD1A1", wheel: "#FF6B6B" },
  3: { bg: "#a18cd1", fog: "#fbc2eb", stone: "#E0BBE4", accent: "#957DAD", path: "#D291BC", wheel: "#FEC8D8" },
  4: { bg: "#e0fff4", fog: "#e0fff4", stone: "#c7ecee", accent: "#009432", path: "#1289A7", wheel: "#A3CB38" },
  5: { bg: "#ffefd5", fog: "#ffefd5", stone: "#f7f1e3", accent: "#b33939", path: "#ff5252", wheel: "#ffb142" },
  6: { bg: "#130f40", fog: "#130f40", stone: "#30336b", accent: "#f0932b", path: "#686de0", wheel: "#e056fd" },
};

export const LEVELS: LevelData[] = [
  {
    id: 1,
    title: "The Broken Spire",
    hint: "Tap the Red Handle to rotate.",
    theme: THEMES[1],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: -2, y: 0, z: 0 }, links: ["bridge"], size: {x:1, y:1, z:1} },
      { id: "bridge", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 0 }, rotation: 1, isRotatable: true, axis: 'y', links: ["start", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 2 }, links: ["bridge"], size: {x:1, y:1, z:1} },
      { id: "pillar_start", type: BlockType.EMPTY, position: { x: -2, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "pillar_end", type: BlockType.EMPTY, position: { x: 0, y: -2, z: 2 }, size: {x:1, y:3, z:1}, links: [] },
    ]
  },
  {
    id: 2,
    title: "Ascension",
    hint: "Use the Red Handle to rise.",
    theme: THEMES[2],
    startBlockId: "start",
    endBlockId: "end",
    doorRotation: Math.PI / 2,
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: -1, y: 0, z: 0 }, links: ["slider"], size: {x:1, y:1, z:1} },
      { id: "slider", type: BlockType.SLIDER, position: { x: 0, y: 0, z: 0 }, isSlideable: true, axis: 'y', sliderVal: 0, links: ["start", "end"], size: {x:1, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 0 }, links: ["slider"], size: {x:1, y:1, z:1} },
      { id: "pillar_start", type: BlockType.EMPTY, position: { x: -1, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "wall", type: BlockType.EMPTY, position: { x: 0, y: 0, z: -2 }, size: {x:1, y:8, z:1}, links: [] },
      { id: "pillar_end", type: BlockType.EMPTY, position: { x: 1, y: 0, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
    ]
  },
  {
    id: 3,
    title: "The Fork",
    hint: "Align the bridges.",
    theme: THEMES[3],
    startBlockId: "start",
    endBlockId: "end",
    doorRotation: Math.PI / 2,
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["rotator1"], size: {x:1, y:1, z:1} },
      { id: "rotator1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 1, isRotatable: true, axis: 'y', links: ["start", "hub"], size: {x:1, y:1, z:3} },
      { id: "hub", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["rotator1", "rotator2"], size: {x:1, y:1, z:1} },
      { id: "rotator2", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 0 }, rotation: 1, isRotatable: true, axis: 'y', links: ["hub", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 0 }, links: ["rotator2"], size: {x:1, y:1, z:1} },
      { id: "pillar1", type: BlockType.EMPTY, position: { x: 0, y: -2, z: 4 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "pillar2", type: BlockType.EMPTY, position: { x: 0, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "pillar3", type: BlockType.EMPTY, position: { x: 4, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
    ]
  },
  {
    id: 4,
    title: "The Twin Bridges",
    hint: "Align the path.",
    theme: THEMES[4],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: -2, y: 0, z: 0 }, links: ["rot1"], size: {x:1, y:1, z:1} },
      { id: "rot1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 0 }, rotation: 1, isRotatable: true, axis: 'y', links: ["start", "hub"], size: {x:3, y:1, z:1} },
      { id: "hub", type: BlockType.WALKABLE, position: { x: 2, y: 0, z: 0 }, links: ["rot1", "rot2"], size: {x:1, y:1, z:1} },
      { id: "rot2", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 2 }, rotation: 0, isRotatable: true, axis: 'y', links: ["hub", "end"], size: {x:1, y:1, z:3} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 2, y: 0, z: 4 }, links: ["rot2"], size: {x:1, y:1, z:1} },
      { id: "decor1", type: BlockType.EMPTY, position: { x: -2, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "decor2", type: BlockType.EMPTY, position: { x: 2, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "decor3", type: BlockType.EMPTY, position: { x: 2, y: -2, z: 4 }, size: {x:1, y:3, z:1}, links: [] },
    ]
  },
  {
    id: 5,
    title: "The Lift",
    hint: "Ride the slider, then rotate.",
    theme: THEMES[5],
    startBlockId: "start",
    endBlockId: "end",
    doorRotation: Math.PI / 2,
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["slider"], size: {x:1, y:1, z:1} },
      { id: "slider", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "rot"], size: {x:1, y:1, z:1} },
      { id: "rot", type: BlockType.ROTATOR, position: { x: 3, y: 2, z: 0 }, rotation: 1, isRotatable: true, links: ["slider", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 5, y: 2, z: 0 }, links: ["rot"], size: {x:1, y:1, z:1} },
      { id: "d1", type: BlockType.EMPTY, position: { x: 0, y: -2, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
      { id: "d2", type: BlockType.EMPTY, position: { x: 1, y: 0, z: -2 }, size: {x:1, y:8, z:1}, links: [] },
      { id: "d3", type: BlockType.EMPTY, position: { x: 5, y: 0, z: 0 }, size: {x:1, y:3, z:1}, links: [] },
    ]
  },
  {
    id: 6,
    title: "Double Jump",
    hint: "Two lifts are better than one.",
    theme: THEMES[6],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: 1 }, isSlideable: true, sliderVal: 0, links: ["start", "hub"], size: {x:1, y:1, z:1} },
      { id: "hub", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 2 }, links: ["s1", "s2"], size: {x:1, y:1, z:1} },
      { id: "s2", type: BlockType.SLIDER, position: { x: 0, y: 2, z: 3 }, isSlideable: true, sliderVal: 0, links: ["hub", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 4, z: 4 }, links: ["s2"], size: {x:1, y:1, z:1} },
      { id: "w1", type: BlockType.EMPTY, position: { x: 1, y: 0, z: 1 }, size: {x:1, y:6, z:1}, links: [] },
      { id: "w2", type: BlockType.EMPTY, position: { x: -1, y: 2, z: 3 }, size: {x:1, y:8, z:1}, links: [] },
    ]
  },
  {
    id: 7,
    title: "The U-Turn",
    hint: "Wind your way around.",
    theme: THEMES[1],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["start", "h1"], size: {x:1, y:1, z:3} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 4 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 4 }, links: ["r2", "r3"], size: {x:1, y:1, z:1} },
      { id: "r3", type: BlockType.ROTATOR, position: { x: 4, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["h2", "end"], size: {x:1, y:1, z:3} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 0 }, links: ["r3"], size: {x:1, y:1, z:1} },
      { id: "base", type: BlockType.EMPTY, position: { x: 2, y: -2, z: 2 }, size: {x:5, y:1, z:5}, links: [] },
    ]
  },
  {
    id: 8,
    title: "Sky Hook",
    hint: "Coordinate the sliders.",
    theme: THEMES[2],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "r1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 1, y: 2, z: 2 }, rotation: 1, isRotatable: true, links: ["s1", "h2"], size: {x:1, y:1, z:3} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 4 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      { id: "s2", type: BlockType.SLIDER, position: { x: 2, y: 2, z: 4 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 2, y: 4, z: 5 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 9,
    title: "The Snake",
    hint: "Align the spine.",
    theme: THEMES[3],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 0 }, rotation: 1, isRotatable: true, links: ["start", "h1"], size: {x:3, y:1, z:1} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 0 }, links: ["r1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 4, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["h1", "h2"], size: {x:1, y:1, z:3} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 4 }, links: ["r2", "r3"], size: {x:1, y:1, z:1} },
      { id: "r3", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 4 }, rotation: 1, isRotatable: true, links: ["h2", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r3"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 10,
    title: "Up and Over",
    hint: "Cross the gap.",
    theme: THEMES[4],
    startBlockId: "start",
    endBlockId: "end",
    doorRotation: Math.PI / 2,
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: -1 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: -2 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 2, y: 2, z: -2 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 2, z: -2 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      { id: "s2", type: BlockType.SLIDER, position: { x: 4, y: 2, z: -1 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 4, z: 0 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 11,
    title: "The Cross",
    hint: "Navigate the intersection.",
    theme: THEMES[5],
    startBlockId: "start",
    endBlockId: "end",
    doorRotation: Math.PI / 2,
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["start", "h1"], size: {x:1, y:1, z:3} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 4 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 4 }, links: ["r2", "s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 4, y: 0, z: 5 }, isSlideable: true, sliderVal: 0, links: ["h2", "h3"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h3", type: BlockType.WALKABLE, position: { x: 4, y: 2, z: 6 }, links: ["s1", "r3"], size: {x:1, y:1, z:1} },
      { id: "r3", type: BlockType.ROTATOR, position: { x: 2, y: 2, z: 6 }, rotation: 1, isRotatable: true, links: ["h3", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 6 }, links: ["r3"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 12,
    title: "Spiral Ascent",
    hint: "Round and round we go.",
    theme: THEMES[6],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "r1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 1, y: 2, z: 2 }, rotation: 0, isRotatable: true, links: ["s1", "h2"], size: {x:1, y:1, z:3} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 4 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      { id: "s2", type: BlockType.SLIDER, position: { x: 0, y: 2, z: 4 }, isSlideable: true, sliderVal: 0, links: ["h2", "r2"], size: {x:1, y:1, z:1}, crankFace: 'left' },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 0, y: 4, z: 2 }, rotation: 0, isRotatable: true, links: ["s2", "end"], size: {x:1, y:1, z:3} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 4, z: 0 }, links: ["r2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 13,
    title: "Ascension",
    hint: "The final climb.",
    theme: THEMES[1],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: 1 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 2 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 2, y: 2, z: 2 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 2, z: 2 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      { id: "s2", type: BlockType.SLIDER, position: { x: 4, y: 2, z: 3 }, isSlideable: true, sliderVal: 0, links: ["h2", "h3"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h3", type: BlockType.WALKABLE, position: { x: 4, y: 4, z: 4 }, links: ["s2", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 2, y: 4, z: 4 }, rotation: 1, isRotatable: true, links: ["h3", "h4"], size: {x:3, y:1, z:1} },
      { id: "h4", type: BlockType.WALKABLE, position: { x: 0, y: 4, z: 4 }, links: ["r2", "s3"], size: {x:1, y:1, z:1} },
      { id: "s3", type: BlockType.SLIDER, position: { x: 0, y: 4, z: 5 }, isSlideable: true, sliderVal: 0, links: ["h4", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 6, z: 6 }, links: ["s3"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 14,
    title: "Zig Zag",
    hint: "Follow the angles.",
    theme: THEMES[2],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["start", "h1"], size: {x:1, y:1, z:3} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 2, y: 0, z: 4 }, rotation: 1, isRotatable: true, links: ["h1", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 0, z: 4 }, links: ["r2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 15,
    title: "The Stack",
    hint: "Rise up twice.",
    theme: THEMES[3],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 0 }, links: ["s1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Left touches h1. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 2, y: 2, z: 0 }, isSlideable: true, sliderVal: 0, links: ["h1", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 2, y: 4, z: 0 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 16,
    title: "The Loop",
    hint: "Around and up.",
    theme: THEMES[4],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Back touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: 1 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 1 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 2, z: 3 }, rotation: 0, isRotatable: true, links: ["h1", "h2"], size: {x:1, y:1, z:3} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 5 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Left touches h2. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 1, y: 2, z: 5 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 1, y: 4, z: 5 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 17,
    title: "Crossover",
    hint: "Cross the bridge.",
    theme: THEMES[5],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Front touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: -1 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: -1 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 2, y: 2, z: -1 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 2, z: -1 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Front touches h2. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 4, y: 2, z: 0 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 4, z: 0 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 18,
    title: "Towers",
    hint: "Climb the heights.",
    theme: THEMES[6],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 0 }, links: ["s1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Back touches h1. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 1, y: 2, z: 1 }, isSlideable: true, sliderVal: 0, links: ["h1", "h2"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 1, y: 4, z: 1 }, links: ["s2", "s3"], size: {x:1, y:1, z:1} },
      // s3 Back touches h2. Right Open. Crank Right.
      { id: "s3", type: BlockType.SLIDER, position: { x: 1, y: 4, z: 2 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 1, y: 6, z: 2 }, links: ["s3"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 19,
    title: "The Gap",
    hint: "Mind the drop.",
    theme: THEMES[1],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["start", "h1"], size: {x:1, y:1, z:3} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r1", "s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches h1. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 4 }, isSlideable: true, sliderVal: 0, links: ["h1", "h2"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 4 }, links: ["s1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 3, y: 2, z: 4 }, rotation: 1, isRotatable: true, links: ["h2", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 5, y: 2, z: 4 }, links: ["r2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 20,
    title: "Mechanism",
    hint: "Gears turning.",
    theme: THEMES[2],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Back touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 0, y: 0, z: 1 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 2, z: 1 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 2, y: 2, z: 1 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 4, y: 2, z: 1 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Back touches h2. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 4, y: 2, z: 0 }, isSlideable: true, sliderVal: 0, links: ["h2", "h3"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h3", type: BlockType.WALKABLE, position: { x: 4, y: 4, z: 0 }, links: ["s2", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 2, y: 4, z: 0 }, rotation: 1, isRotatable: true, links: ["h3", "end"], size: {x:3, y:1, z:1} },
      { id: "end", type: BlockType.WALKABLE, position: { x: 0, y: 4, z: 0 }, links: ["r2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 21,
    title: "Stairway",
    hint: "One step at a time.",
    theme: THEMES[3],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 0 }, links: ["s1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Left touches h1. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 2, y: 2, z: 0 }, isSlideable: true, sliderVal: 0, links: ["h1", "h2"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 2, y: 4, z: 0 }, links: ["s2", "s3"], size: {x:1, y:1, z:1} },
      // s3 Left touches h2. Right Open. Crank Right.
      { id: "s3", type: BlockType.SLIDER, position: { x: 3, y: 4, z: 0 }, isSlideable: true, sliderVal: 0, links: ["h2", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 3, y: 6, z: 0 }, links: ["s3"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 22,
    title: "The Grid",
    hint: "Find the route.",
    theme: THEMES[4],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 0, y: 0, z: 2 }, rotation: 0, isRotatable: true, links: ["start", "h1"], size: {x:1, y:1, z:3} },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 4 }, links: ["r1", "s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches h1. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 4 }, isSlideable: true, sliderVal: 0, links: ["h1", "h2"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 4 }, links: ["s1", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 1, y: 2, z: 6 }, rotation: 0, isRotatable: true, links: ["h2", "h3"], size: {x:1, y:1, z:3} },
      { id: "h3", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 8 }, links: ["r2", "s2"], size: {x:1, y:1, z:1} },
      // s2 Left touches h3. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 2, y: 2, z: 8 }, isSlideable: true, sliderVal: 0, links: ["h3", "end"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 2, y: 4, z: 8 }, links: ["s2"], size: {x:1, y:1, z:1} },
    ]
  },
  {
    id: 23,
    title: "Grand Spire",
    hint: "The peak awaits.",
    theme: THEMES[5],
    startBlockId: "start",
    endBlockId: "end",
    blocks: [
      { id: "start", type: BlockType.WALKABLE, position: { x: 0, y: 0, z: 0 }, links: ["s1"], size: {x:1, y:1, z:1} },
      // s1 Left touches Start. Right Open. Crank Right.
      { id: "s1", type: BlockType.SLIDER, position: { x: 1, y: 0, z: 0 }, isSlideable: true, sliderVal: 0, links: ["start", "h1"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h1", type: BlockType.WALKABLE, position: { x: 1, y: 2, z: 0 }, links: ["s1", "r1"], size: {x:1, y:1, z:1} },
      { id: "r1", type: BlockType.ROTATOR, position: { x: 3, y: 2, z: 0 }, rotation: 1, isRotatable: true, links: ["h1", "h2"], size: {x:3, y:1, z:1} },
      { id: "h2", type: BlockType.WALKABLE, position: { x: 5, y: 2, z: 0 }, links: ["r1", "s2"], size: {x:1, y:1, z:1} },
      // s2 Left touches h2. Right Open. Crank Right.
      { id: "s2", type: BlockType.SLIDER, position: { x: 5, y: 2, z: 1 }, isSlideable: true, sliderVal: 0, links: ["h2", "h3"], size: {x:1, y:1, z:1}, crankFace: 'right' },
      { id: "h3", type: BlockType.WALKABLE, position: { x: 5, y: 4, z: 1 }, links: ["s2", "r2"], size: {x:1, y:1, z:1} },
      { id: "r2", type: BlockType.ROTATOR, position: { x: 5, y: 4, z: 3 }, rotation: 0, isRotatable: true, links: ["h3", "h4"], size: {x:1, y:1, z:3} },
      { id: "h4", type: BlockType.WALKABLE, position: { x: 5, y: 4, z: 5 }, links: ["r2", "s3"], size: {x:1, y:1, z:1} },
      // s3 Right touches h4. Front Open (Visible from isometric). Crank Front.
      { id: "s3", type: BlockType.SLIDER, position: { x: 4, y: 4, z: 5 }, isSlideable: true, sliderVal: 0, links: ["h4", "end"], size: {x:1, y:1, z:1}, crankFace: 'front' },
      { id: "end", type: BlockType.WALKABLE, position: { x: 4, y: 6, z: 5 }, links: ["s3"], size: {x:1, y:1, z:1} },
    ]
  }
];