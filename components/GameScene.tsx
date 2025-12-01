import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrthographicCamera, Environment, ContactShadows, useCursor, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { LevelData, BlockType, Vector3, BlockData } from '../types';
import Character from './Character';
import { playStep, playRotate, playWin, playSlide } from '../services/audioService';

// --- Constants ---
const SLIDER_HEIGHT = 2; // How high a slider moves

// --- Helper Functions for Physics/Logic ---

// Get the actual world position of a block including slider offset
const getRenderedBlockPosition = (b: BlockData): THREE.Vector3 => {
  let y = b.position.y;
  if (b.type === BlockType.SLIDER) {
    y += (b.sliderVal || 0) * SLIDER_HEIGHT;
  }
  return new THREE.Vector3(b.position.x, y, b.position.z);
};

// Get the effective size (bounding box) based on rotation
const getRenderedBlockSize = (b: BlockData) => {
  const size = { x: b.size?.x || 1, y: b.size?.y || 1, z: b.size?.z || 1 };
  
  // If rotated 90 or 270 degrees (odd rotations), swap X and Z dimensions
  if (b.type === BlockType.ROTATOR && (b.rotation || 0) % 2 !== 0) {
    return { x: size.z, y: size.y, z: size.x };
  }
  return size;
};

// Check if two blocks are physically aligned/connecting
const checkAlignment = (b1: BlockData, b2: BlockData): boolean => {
  const p1 = getRenderedBlockPosition(b1);
  const p2 = getRenderedBlockPosition(b2);

  // 1. Vertical Alignment Check (Must be at same height)
  if (Math.abs(p1.y - p2.y) > 0.1) return false;

  // 2. Bounding Box Overlap/Touch Check (XZ Plane)
  const s1 = getRenderedBlockSize(b1);
  const s2 = getRenderedBlockSize(b2);

  // Calculate extents (min/max) for both blocks
  // Using a small epsilon (0.1) to allow "touching" to count as valid
  const tolerance = 0.1;
  
  const b1Bounds = {
    minX: p1.x - s1.x / 2, maxX: p1.x + s1.x / 2,
    minZ: p1.z - s1.z / 2, maxZ: p1.z + s1.z / 2,
  };
  
  const b2Bounds = {
    minX: p2.x - s2.x / 2, maxX: p2.x + s2.x / 2,
    minZ: p2.z - s2.z / 2, maxZ: p2.z + s2.z / 2,
  };

  // Check overlap in X and Z
  // Two rectangles touch/overlap if their ranges overlap in both dimensions
  // We expand the range slightly by tolerance to detect touching faces
  const overlapX = (b1Bounds.minX - tolerance <= b2Bounds.maxX) && (b1Bounds.maxX + tolerance >= b2Bounds.minX);
  const overlapZ = (b1Bounds.minZ - tolerance <= b2Bounds.maxZ) && (b1Bounds.maxZ + tolerance >= b2Bounds.minZ);

  return overlapX && overlapZ;
};

// --- Components ---

interface InteractiveBlockProps {
  data: BlockData;
  theme: any;
  onInteract: (id: string, type: string) => void;
  onWalk: (id: string) => void;
  isCurrent: boolean;
}

const InteractiveBlock: React.FC<InteractiveBlockProps> = ({ data, theme, onInteract, onWalk, isCurrent }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  const [handleHovered, setHandleHover] = useState(false);
  
  useCursor(hovered && !handleHovered, 'pointer', 'auto');
  useCursor(handleHovered, 'pointer', 'auto');

  const targetRotY = data.type === BlockType.ROTATOR ? (data.rotation || 0) * (Math.PI / 2) : 0;
  const targetY = data.type === BlockType.SLIDER 
    ? data.position.y + (data.sliderVal || 0) * SLIDER_HEIGHT 
    : data.position.y;
    
  const targetPos = new THREE.Vector3(data.position.x, targetY, data.position.z);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos, delta * 8);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(
        meshRef.current.rotation.y, 
        targetRotY, 
        delta * 8
      );
    }
  });

  const handleWalkClick = (e: any) => {
    e.stopPropagation();
    onWalk(data.id);
  };

  const handleInteractClick = (e: any) => {
    e.stopPropagation();
    if (data.isRotatable) onInteract(data.id, 'rotate');
    else if (data.isSlideable) onInteract(data.id, 'slide');
  };

  const matColor = data.type === BlockType.ROTATOR || data.type === BlockType.SLIDER ? theme.wheel : theme.path;
  const geoArgs: [number, number, number] = [
    data.size?.x || 1, 
    data.size?.y || 1, 
    data.size?.z || 1
  ];

  // Logic to position the handle based on face
  const sizeX = data.size?.x || 1;
  const sizeZ = data.size?.z || 1;
  const face = data.crankFace || 'auto';
  
  let handleGroupPos: [number, number, number] = [0, 0, 0];
  let handleGroupRot: [number, number, number] = [0, 0, 0];

  if (face === 'front') {
      handleGroupPos = [0, 0, sizeZ / 2];
      handleGroupRot = [Math.PI / 2, 0, 0];
  } else if (face === 'back') {
      handleGroupPos = [0, 0, -sizeZ / 2];
      handleGroupRot = [-Math.PI / 2, 0, 0];
  } else if (face === 'right') {
      handleGroupPos = [sizeX / 2, 0, 0];
      handleGroupRot = [0, 0, -Math.PI / 2];
  } else if (face === 'left') {
      handleGroupPos = [-sizeX / 2, 0, 0];
      handleGroupRot = [0, 0, Math.PI / 2];
  } else {
      // Auto logic: Place on the wider face (usually exposed)
      const isOnZFace = sizeX >= sizeZ;
      if (isOnZFace) {
          handleGroupPos = [0, 0, sizeZ / 2];
          handleGroupRot = [Math.PI / 2, 0, 0];
      } else {
          handleGroupPos = [sizeX / 2, 0, 0];
          handleGroupRot = [0, 0, -Math.PI / 2];
      }
  }
    
  const isSlider = data.type === BlockType.SLIDER;
  
  // Static track position calculation (outside animated group)
  // Positioned relative to world, slightly behind the block center to avoid clipping with agent
  const trackPosition: [number, number, number] = [
    data.position.x,
    data.position.y + SLIDER_HEIGHT / 2,
    data.position.z - 0.45
  ];

  return (
    <>
      <group ref={meshRef} position={[data.position.x, data.position.y, data.position.z]}>
        {/* Block Body */}
        <mesh 
          onClick={handleWalkClick} 
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); }} 
          onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
          castShadow 
          receiveShadow
        >
          <boxGeometry args={geoArgs} />
          <meshStandardMaterial color={matColor} roughness={0.8} />
        </mesh>
        
        {/* Interactive Handle */}
        {(data.isRotatable || data.isSlideable) && (
          <group 
            position={handleGroupPos}
            rotation={handleGroupRot}
            onClick={handleInteractClick}
            onPointerOver={(e) => { e.stopPropagation(); setHandleHover(true); }} 
            onPointerOut={(e) => { e.stopPropagation(); setHandleHover(false); }}
          >
            {/* Stem */}
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
              <meshStandardMaterial color="#555" />
            </mesh>
            
            {/* Knob Base */}
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
              <meshStandardMaterial 
                color={handleHovered ? "#ff7675" : "#d63031"} 
                emissive={handleHovered ? "#ff7675" : "#000"}
                emissiveIntensity={0.5}
              />
            </mesh>
            
            {/* Knob Detail (White Cap) */}
            <mesh position={[0, 0.31, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
                <meshStandardMaterial color="#fff" />
            </mesh>

            {/* Hover Halo */}
            {handleHovered && (
              <mesh position={[0, 0.25, 0]} rotation={[0,0,0]}>
                <ringGeometry args={[0.35, 0.45, 32]} />
                <meshBasicMaterial color="#fff" side={THREE.DoubleSide} transparent opacity={0.5} />
              </mesh>
            )}
          </group>
        )}

        {/* Decor for Rotators (Top Circle) */}
        {(data.isRotatable) && (
          <mesh position={[0, (data.size?.y || 1)/2 + 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.3, 0.4, 32]} />
            <meshStandardMaterial color="#fff" opacity={0.5} transparent />
          </mesh>
        )}
      </group>

      {/* Slider Visual Track - Static, outside animated group */}
      {isSlider && (
        <mesh position={trackPosition} castShadow receiveShadow>
            <boxGeometry args={[0.1, SLIDER_HEIGHT + (data.size?.y||1), 0.1]} />
            <meshStandardMaterial color="#2d3436" roughness={1} />
        </mesh>
      )}
    </>
  );
};

const DecorBlock: React.FC<{ data: BlockData; theme: any }> = ({ data, theme }) => {
  return (
    <mesh position={[data.position.x, data.position.y, data.position.z]} receiveShadow>
       <boxGeometry args={[data.size?.x || 1, data.size?.y || 1, data.size?.z || 1]} />
       <meshStandardMaterial color={theme.stone} />
    </mesh>
  );
};

// --- Scene Manager ---

interface SceneContentProps {
  level: LevelData;
  onWin: () => void;
}

const SceneContent: React.FC<SceneContentProps> = ({ level, onWin }) => {
  const [blocks, setBlocks] = useState<BlockData[]>(level.blocks);
  const [playerBlockId, setPlayerBlockId] = useState(level.startBlockId);
  const [playerPosition, setPlayerPosition] = useState<Vector3>({x:0, y:0, z:0});
  
  // Initialize Level
  useEffect(() => {
    setBlocks(level.blocks);
    setPlayerBlockId(level.startBlockId);
    const start = level.blocks.find(b => b.id === level.startBlockId);
    if(start) {
      setPlayerPosition(getRenderedBlockPosition(start));
    }
  }, [level]);

  const getBlock = (id: string) => blocks.find(b => b.id === id);

  const handleInteract = (id: string, action: string) => {
    // 1. Calculate New State
    let newBlocks = [...blocks];
    const bIndex = newBlocks.findIndex(b => b.id === id);
    if (bIndex === -1) return;
    
    const oldBlock = newBlocks[bIndex];
    const newBlock = { ...oldBlock };

    if (action === 'rotate') {
      playRotate();
      newBlock.rotation = (oldBlock.rotation || 0) + 1;
    } else if (action === 'slide') {
      playSlide();
      newBlock.sliderVal = oldBlock.sliderVal === 0 ? 1 : 0;
    }
    
    // Update blocks state
    newBlocks[bIndex] = newBlock;
    setBlocks(newBlocks);

    // 2. Sync Player if they are on the moving block
    if (id === playerBlockId) {
      // Calculate where the block is moving to
      // Need to use the NEW block state
      const newPos = getRenderedBlockPosition(newBlock);
      setPlayerPosition(newPos);
    }
  };

  const handleWalk = (targetId: string) => {
    if (playerBlockId === targetId) return;

    const current = getBlock(playerBlockId);
    const target = getBlock(targetId);
    
    if (!current || !target) return;

    // Check 1: Are they linked in the level graph?
    const isLinked = current.links.includes(targetId) || target.links.includes(playerBlockId);
    
    if (isLinked) {
        // Check 2: Are they physically aligned right now?
        const aligned = checkAlignment(current, target);
        
        if (aligned) {
          playStep();
          setPlayerBlockId(targetId);
          
          // Get target position including any slider offsets
          const targetPos = getRenderedBlockPosition(target);
          setPlayerPosition(targetPos);

          if (targetId === level.endBlockId) {
              playWin();
              setTimeout(onWin, 1000);
          }
        } else {
           // Optional: Play a "can't move" sound or visual shake
        }
    }
  };

  return (
    <>
      <color attach="background" args={[level.theme.bg]} />
      <fog attach="fog" args={[level.theme.fog, 20, 80]} />
      
      <group rotation={[0, Math.PI / 4, 0]}>
        {blocks.map(block => (
          block.type === BlockType.EMPTY ? (
            <DecorBlock key={block.id} data={block} theme={level.theme} />
          ) : (
            <InteractiveBlock 
              key={block.id} 
              data={block} 
              theme={level.theme}
              onInteract={handleInteract}
              onWalk={handleWalk}
              isCurrent={block.id === playerBlockId}
            />
          )
        ))}
        <Character position={playerPosition} color={level.theme.accent} />
        
        {/* End Goal Indicator */}
        {(() => {
           const end = getBlock(level.endBlockId);
           if (!end) return null;
           const endPos = getRenderedBlockPosition(end);
           const doorRot = level.doorRotation || 0;
           return (
             <mesh position={[endPos.x, endPos.y + 1, endPos.z]} rotation={[0, doorRot, 0]}>
               <boxGeometry args={[0.6, 1.2, 0.1]} />
               <meshStandardMaterial color="#333" />
             </mesh>
           )
        })()}
      </group>
      
      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={40} blur={2.5} far={10} />
      <Environment preset="city" />
    </>
  );
};

export interface GameSceneProps {
  level: LevelData;
  onWin: () => void;
}

const GameScene: React.FC<GameSceneProps> = ({ level, onWin }) => {
  return (
    <div className="w-full h-full">
      <Canvas shadows dpr={[1, 2]}>
        <OrthographicCamera 
            makeDefault 
            position={[20, 20, 20]} 
            zoom={40} 
            near={-50} 
            far={200}
        />
        {/* Enable pan to support tall levels */}
        <OrbitControls 
          enableRotate={true}
          enableZoom={true}
          enablePan={true}
          minZoom={20}
          maxZoom={100}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 20, 5]} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <Suspense fallback={null}>
            <SceneContent level={level} onWin={onWin} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default GameScene;