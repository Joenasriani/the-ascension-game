import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import { RoundedBox, OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";
import type { BlockData, LevelData, Vector3 } from "../types";
import { BlockType } from "../types";
import {
  position,
  canWalk,
  perspectiveConnected,
  type Snapshot,
  type Action,
} from "../game/engine";
import Character from "./Character";
export interface Motion {
  from: Snapshot;
  to: Snapshot;
  action: Action;
  duration: number;
  started: number;
}
export interface SceneProps {
  level: LevelData;
  snapshot: Snapshot;
  motion: Motion | null;
  selected: string;
  onSelect: (id: string) => void;
  onAction: (a: Action) => void;
  onSettled: () => void;
  reduced: boolean;
  quality: "low" | "medium" | "high";
  paused: boolean;
}
const mix = (a: Vector3, b: Vector3, t: number) => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  z: a.z + (b.z - a.z) * t,
});
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
function CameraRig({
  level,
  view,
  quality,
}: {
  level: LevelData;
  view: number;
  quality: string;
}) {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const points = level.blocks
      .filter((b) => b.type !== BlockType.EMPTY)
      .flatMap((b) => {
        const p = position(b);
        return [
          new THREE.Vector3(p.x, p.y, p.z),
          new THREE.Vector3(p.x, p.y + (b.isSlideable ? 2 : 0) + 1.5, p.z),
        ];
      });
    const box = new THREE.Box3().setFromPoints(points),
      target = box.getCenter(new THREE.Vector3()),
      angle = Math.PI / 4 + (view * Math.PI) / 2;
    camera.position.set(
      target.x + 20 * Math.sin(angle),
      target.y + 20,
      target.z + 20 * Math.cos(angle),
    );
    camera.lookAt(target);
    camera.updateMatrixWorld();
    const local = points.map((p) =>
      p.clone().applyMatrix4(camera.matrixWorldInverse),
    );
    const span = new THREE.Box3()
      .setFromPoints(local)
      .getSize(new THREE.Vector3());
    const c = camera as THREE.OrthographicCamera;
    c.zoom = Math.min(
      65,
      size.width / (span.x + 5),
      size.height / (span.y + 5),
    );
    c.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, level, view, quality, invalidate]);
  return null;
}
function Block({
  data,
  old,
  t,
  selected,
  valid,
  current,
  goal,
  onSelect,
  onAction,
  theme,
  reduced,
}: {
  data: BlockData;
  old: BlockData;
  t: number;
  selected: boolean;
  valid: boolean;
  current: boolean;
  goal: boolean;
  onSelect: (id: string) => void;
  onAction: (a: Action) => void;
  theme: LevelData["theme"];
  reduced: boolean;
}) {
  const p = mix(position(old), position(data), t),
    s = data.size ?? { x: 1, y: 1, z: 1 };
  let before = ((old.rotation ?? 0) * Math.PI) / 2,
    after = ((data.rotation ?? 0) * Math.PI) / 2;
  if (after < before) after += Math.PI * 2;
  const turning = before !== after;
  const turnT = turning ? ease(Math.max(0, Math.min(1, (t - 0.2) / 0.6))) : t;
  const clearance = turning
    ? 1.08 * (t < 0.2 ? ease(t / 0.2) : t > 0.8 ? ease((1 - t) / 0.2) : 1)
    : 0;
  p.y += clearance;
  const angle = before + (after - before) * turnT;
  const interact = data.isRotatable || data.isSlideable;
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
    onAction({ type: "walk", id: data.id });
  };
  const operate = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(data.id);
    onAction({ type: "operate", id: data.id });
  };
  const color =
    data.type === BlockType.EMPTY
      ? theme.stone
      : interact
        ? theme.wheel
        : theme.path;
  return (
    <>
      {data.isSlideable && (
        <group>
          <mesh
            position={[
              data.position.x - 0.36,
              data.position.y + 1,
              data.position.z - 0.38,
            ]}
          >
            <boxGeometry args={[0.07, 3, 0.07]} />
            <meshStandardMaterial color="#625957" />
          </mesh>
          <mesh
            position={[
              data.position.x + 0.36,
              data.position.y + 1,
              data.position.z - 0.38,
            ]}
          >
            <boxGeometry args={[0.07, 3, 0.07]} />
            <meshStandardMaterial color="#625957" />
          </mesh>
          <mesh
            position={[
              p.x,
              data.position.y + 2 - (p.y - data.position.y),
              p.z - 0.67,
            ]}
            castShadow
          >
            <boxGeometry args={[0.5, 0.45, 0.25]} />
            <meshStandardMaterial color="#746657" />
          </mesh>
        </group>
      )}
      <group position={[p.x, p.y, p.z]} rotation={[0, angle, 0]}>
        <RoundedBox
          args={[s.x, s.y, s.z]}
          radius={0.045}
          smoothness={2}
          castShadow
          receiveShadow
          onClick={data.type !== BlockType.EMPTY ? click : undefined}
        >
          <meshStandardMaterial
            color={color}
            roughness={0.85}
            metalness={0}
            emissive={selected ? "#403124" : "#000000"}
            emissiveIntensity={selected ? 0.12 : 0}
          />
        </RoundedBox>
        {data.type !== BlockType.EMPTY && (
          <mesh
            position={[0, s.y / 2 + 0.007, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <ringGeometry
              args={[current ? 0.23 : 0.11, current ? 0.27 : 0.145, 32]}
            />
            <meshBasicMaterial
              color={current ? "#34312c" : valid ? "#fff9df" : "#786454"}
              transparent
              opacity={current || valid ? 0.9 : 0.35}
              depthWrite={false}
            />
          </mesh>
        )}
        {interact && (
          <group
            position={[0, s.y / 2 + 0.1, s.z / 2 + 0.23]}
            onClick={operate}
          >
            <mesh position={[0, 0.1, 0]} castShadow>
              <cylinderGeometry args={[0.16, 0.19, 0.2, 16]} />
              <meshStandardMaterial color="#694c3b" />
            </mesh>
            <mesh position={[0.16, 0.22, 0]} castShadow>
              <boxGeometry args={[0.44, 0.06, 0.08]} />
              <meshStandardMaterial color="#f9eddb" />
            </mesh>
            <mesh position={[0.34, 0.28, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.065, 0.15, 12]} />
              <meshStandardMaterial color="#a34232" />
            </mesh>
          </group>
        )}
        {data.isRotatable && (
          <mesh position={[0, -s.y / 2 - 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.4, 0.3, 24]} />
            <meshStandardMaterial color="#6d5b53" />
          </mesh>
        )}
        {goal && (
          <group position={[0, s.y / 2, 0]}>
            <mesh position={[-0.31, 0.61, 0]} castShadow>
              <boxGeometry args={[0.14, 1.22, 0.2]} />
              <meshStandardMaterial color="#f4e9d5" />
            </mesh>
            <mesh position={[0.31, 0.61, 0]} castShadow>
              <boxGeometry args={[0.14, 1.22, 0.2]} />
              <meshStandardMaterial color="#f4e9d5" />
            </mesh>
            <mesh position={[0, 1.18, 0]} castShadow>
              <boxGeometry args={[0.75, 0.16, 0.2]} />
              <meshStandardMaterial color="#f4e9d5" />
            </mesh>
            <mesh position={[0, 0.61, -0.075]}>
              <planeGeometry args={[0.48, 1.1]} />
              <meshStandardMaterial color="#3e3a36" side={THREE.DoubleSide} />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
}
function World(props: SceneProps) {
  const { level, snapshot: s, motion, reduced, onSettled } = props;
  const { invalidate } = useThree();
  const clock = useRef({ t: motion ? 0 : 1, done: false });
  // The scene re-renders only while a finite transition is active.
  const [frame, setFrame] = useFrameState();
  useLayoutEffect(() => {
    clock.current = { t: motion ? 0 : 1, done: false };
    setFrame(0);
    invalidate();
  }, [motion, invalidate]);
  useFrame(() => {
    if (!motion || props.paused) return;
    const t = Math.min(
      1,
      (performance.now() - motion.started) / motion.duration,
    );
    clock.current.t = t;
    setFrame(t);
    if (t < 1) invalidate();
    else if (!clock.current.done) {
      clock.current.done = true;
      onSettled();
    }
  });
  const t = motion ? ease(frame) : 1,
    old = motion?.from ?? s,
    target = motion?.to ?? s;
  const pa = position(old.blocks.find((b) => b.id === old.player)!),
    pb = position(target.blocks.find((b) => b.id === target.player)!);
  const player = mix(pa, pb, t);
  if (
    motion?.action.type === "operate" &&
    motion.action.id === old.player &&
    old.blocks.find((b) => b.id === old.player)?.isRotatable
  )
    player.y +=
      1.08 * (t < 0.2 ? ease(t / 0.2) : t > 0.8 ? ease((1 - t) / 0.2) : 1);
  const background = useMemo(
    () =>
      new THREE.Color(level.theme.bg).lerp(new THREE.Color("#eee9dd"), 0.65),
    [level],
  );
  return (
    <>
      <color attach="background" args={[background]} />
      <CameraRig
        level={level}
        view={old.view + (((target.view - old.view + 6) % 4) - 2) * t}
        quality={props.quality}
      />
      <hemisphereLight args={["#fff4df", "#9c8996", 2]} />
      <directionalLight
        position={[4, 16, 8]}
        intensity={2.8}
        castShadow={props.quality !== "low"}
        shadow-mapSize={props.quality === "high" ? [2048, 2048] : [1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-far={65}
        shadow-normalBias={0.04}
      />
      <group>
        {target.blocks.map((b) => (
          <Block
            key={b.id}
            data={b}
            old={old.blocks.find((x) => x.id === b.id) ?? b}
            t={t}
            selected={props.selected === b.id}
            valid={canWalk(level, s, b.id)}
            current={s.player === b.id}
            goal={b.id === level.endBlockId}
            onSelect={props.onSelect}
            onAction={props.onAction}
            theme={level.theme}
            reduced={reduced}
          />
        ))}
        <Character
          position={player}
          from={pa}
          progress={frame}
          walking={!!motion && motion.action.type === "walk"}
          reduced={reduced}
          color="#9f4437"
          transfer={
            !!motion &&
            motion.action.type === "walk" &&
            perspectiveConnected(level, old, old.player, target.player)
          }
        />
      </group>
    </>
  );
}
// React state updates are scoped to the active finite animation; idle rendering uses demand mode.
import { useState } from "react";
function useFrameState() {
  return useState(0);
}
export default function GameScene(props: SceneProps) {
  return (
    <Canvas
      shadows={props.quality !== "low"}
      dpr={
        props.quality === "low"
          ? 1
          : props.quality === "medium"
            ? [1, 1.5]
            : [1, 2]
      }
      frameloop="demand"
      gl={{ antialias: props.quality !== "low", alpha: false }}
      fallback={
        <p className="fallback">
          3D is unavailable on this device. Use the accessible action controls
          below to play.
        </p>
      }
    >
      <OrthographicCamera makeDefault near={0.1} far={150} />
      <World {...props} />
    </Canvas>
  );
}
