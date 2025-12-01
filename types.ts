export enum BlockType {
  WALKABLE = 'WALKABLE',
  ROTATOR = 'ROTATOR',
  SLIDER = 'SLIDER',
  BRIDGE = 'BRIDGE',
  EMPTY = 'EMPTY'
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface BlockData {
  id: string;
  type: BlockType;
  position: Vector3;
  size?: Vector3; // Custom size for scaling
  rotation?: number; // 0, 1, 2, 3 (multiples of 90 deg)
  isRotatable?: boolean;
  isSlideable?: boolean;
  sliderVal?: number; // 0 to 1
  axis?: 'x' | 'y' | 'z'; // Axis of movement/rotation
  crankFace?: 'front' | 'back' | 'left' | 'right' | 'auto'; // Manual handle positioning
  links: string[]; // IDs of neighbors
}

export interface LevelData {
  id: number;
  title: string;
  hint: string;
  theme: {
    bg: string;
    fog: string;
    stone: string;
    accent: string;
    path: string;
    wheel: string;
  };
  blocks: BlockData[];
  startBlockId: string;
  endBlockId: string;
  doorRotation?: number;
}

export interface ThemeColors {
  stone: string;
  accent: string;
  path: string;
  wheel: string;
  bg: string;
}