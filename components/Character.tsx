import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vector3 } from '../types';

interface CharacterProps {
  position: Vector3;
  color: string;
}

const Character: React.FC<CharacterProps> = ({ position, color }) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetPos = new THREE.Vector3(position.x, position.y + 0.6, position.z);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth lerp to new position
      meshRef.current.position.lerp(targetPos, delta * 5);
      
      // Idle animation (bobbing)
      meshRef.current.children[0].position.y = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={[position.x, position.y + 0.6, position.z]}>
      {/* Body */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.2, 0.8, 16]} />
        <meshStandardMaterial color="#fff" />
      </mesh>
      {/* Hat/Head */}
      <mesh position={[0, 0.2, 0]} castShadow>
         <cylinderGeometry args={[0.22, 0.25, 0.3, 16]} />
         <meshStandardMaterial color={color} />
      </mesh>
      {/* Shadow Blob */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};

export default Character;
