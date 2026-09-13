import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Vector3 } from "../types";
export interface CharacterProps {
  position: Vector3;
  from: Vector3;
  progress: number;
  walking: boolean;
  reduced: boolean;
  color: string;
  transfer: boolean;
}
export default function Character({
  position: p,
  from,
  progress: t,
  walking,
  reduced,
  color,
  transfer,
}: CharacterProps) {
  const root = useRef<THREE.Group>(null),
    body = useRef<THREE.Group>(null),
    left = useRef<THREE.Mesh>(null),
    right = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!root.current) return;
    const dx = p.x - from.x,
      dz = p.z - from.z;
    const distance = Math.hypot(dx, dz);
    if (walking && distance > 0.01)
      root.current.rotation.y = Math.atan2(dx, dz);
    const stride =
      walking && !reduced
        ? Math.sin(t * Math.PI * Math.max(2, Math.round(distance * 3)))
        : 0;
    if (left.current) left.current.rotation.x = stride * 0.5;
    if (right.current) right.current.rotation.x = -stride * 0.5;
    if (body.current)
      body.current.position.y =
        !reduced && walking ? Math.abs(stride) * 0.025 : 0;
    root.current.scale.setScalar(
      transfer && !reduced ? 1 - Math.sin(Math.PI * t) * 0.5 : 1,
    );
  });
  return (
    <group ref={root} position={[p.x, p.y + 0.5, p.z]}>
      <group ref={body}>
        <mesh position={[0, 0.44, 0]} castShadow>
          <coneGeometry args={[0.22, 0.58, 12]} />
          <meshStandardMaterial color="#f9f4e9" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 12]} />
          <meshStandardMaterial color="#f5d9b8" />
        </mesh>
        <mesh position={[0, 0.86, 0]} castShadow>
          <coneGeometry args={[0.23, 0.18, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 0.64, 0.075]}>
          <boxGeometry args={[0.22, 0.06, 0.12]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={left} position={[-0.08, 0.12, 0]} castShadow>
          <boxGeometry args={[0.09, 0.22, 0.12]} />
          <meshStandardMaterial color="#44403d" />
        </mesh>
        <mesh ref={right} position={[0.08, 0.12, 0]} castShadow>
          <boxGeometry args={[0.09, 0.22, 0.12]} />
          <meshStandardMaterial color="#44403d" />
        </mesh>
      </group>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.22, 24]} />
        <meshBasicMaterial
          color="#382d27"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
