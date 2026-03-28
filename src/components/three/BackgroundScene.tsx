// src/components/three/BackgroundScene.tsx
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

// ── LARGE PARTICLE FIELD ─────────────────────────────────────
function ParticleField() {
  const count = 2000;
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);
    const colorOptions = [
      new THREE.Color("#1C6E4A"),
      new THREE.Color("#A8C686"),
      new THREE.Color("#556B2F"),
      new THREE.Color("#2A8F62"),
    ];
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    pointsRef.current.rotation.x = state.clock.elapsedTime * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={count} array={colors}    itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ── FLOATING DISTORTED SPHERES ────────────────────────────────
function DistortedSphere({
  position, color, speed, distort, scale, opacity,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  distort: number;
  scale: number;
  opacity: number;
}) {
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={1.5}>
      <mesh position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={distort}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={opacity}
        />
      </mesh>
    </Float>
  );
}

// ── WIREFRAME ICOSAHEDRON ─────────────────────────────────────
function WireframeShape({
  position, speed,
}: {
  position: [number, number, number];
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x = state.clock.elapsedTime * speed;
    meshRef.current.rotation.y = state.clock.elapsedTime * speed * 1.3;
  });
  return (
    <mesh ref={meshRef} position={position}>
      <icosahedronGeometry args={[1.5, 1]} />
      <meshStandardMaterial
        color="#1C6E4A"
        emissive="#1C6E4A"
        emissiveIntensity={0.3}
        wireframe
        transparent
        opacity={0.15}
      />
    </mesh>
  );
}

// ── ROTATING TORUS ────────────────────────────────────────────
function RotatingTorus({
  position, rotation, color, opacity,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = rotation[0] + state.clock.elapsedTime * 0.1;
    ref.current.rotation.y = rotation[1] + state.clock.elapsedTime * 0.15;
    ref.current.rotation.z = rotation[2] + state.clock.elapsedTime * 0.05;
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[2, 0.02, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={opacity}
      />
    </mesh>
  );
}

// ── CONSTELLATION LINES ───────────────────────────────────────
function ConstellationLines() {
  const ref = useRef<THREE.LineSegments>(null);

  const { positions } = useMemo(() => {
    const points: number[] = [];
    const nodeCount = 20;
    const nodes: [number, number, number][] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push([
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15,
      ]);
    }

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = nodes[i][0] - nodes[j][0];
        const dy = nodes[i][1] - nodes[j][1];
        const dz = nodes[i][2] - nodes[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 10) {
          points.push(...nodes[i], ...nodes[j]);
        }
      }
    }

    return { positions: new Float32Array(points) };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.01;
    ref.current.rotation.x = state.clock.elapsedTime * 0.005;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#1C6E4A" transparent opacity={0.15} />
    </lineSegments>
  );
}

// ── GRID PLANE ────────────────────────────────────────────────
function GridPlane() {
  const ref = useRef<THREE.GridHelper>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.position.y  = -6;
    ref.current.rotation.x  = 0.3;
    (ref.current.material as THREE.Material & { opacity: number }).opacity =
      0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
  });
  return (
    <gridHelper
      ref={ref}
      args={[60, 40, "#1C6E4A", "#1C6E4A"]}
      position={[0, -6, 0]}
      rotation={[0.3, 0, 0]}
    />
  );
}

// ── MAIN EXPORT ───────────────────────────────────────────────
export default function BackgroundScene() {
  return (
    <div
      style={{
        position:      "fixed",
        top:           0,
        left:          0,
        width:         "100%",
        height:        "100%",
        zIndex:        0,
        pointerEvents: "none",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 65 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10,  10,  10]} intensity={2}   color="#1C6E4A" />
        <pointLight position={[-10, -10, -5]} intensity={1}   color="#A8C686" />
        <pointLight position={[0,   15,  0]}  intensity={0.8} color="#556B2F" />

        {/* Stars */}
        <Stars
          radius={80}
          depth={60}
          count={4000}
          factor={3}
          saturation={0.5}
          fade
          speed={0.4}
        />

        {/* Distorted floating spheres */}
        <DistortedSphere position={[-6,  3,  -8]}  color="#1C6E4A" speed={1.2} distort={0.4} scale={1.5} opacity={0.12} />
        <DistortedSphere position={[6,  -2,  -10]} color="#556B2F" speed={0.8} distort={0.3} scale={2.0} opacity={0.10} />
        <DistortedSphere position={[0,   4,  -12]} color="#A8C686" speed={1.5} distort={0.5} scale={1.2} opacity={0.08} />
        <DistortedSphere position={[-4, -4,  -6]}  color="#2A8F62" speed={1.0} distort={0.35} scale={0.8} opacity={0.15} />
        <DistortedSphere position={[5,   5,  -15]} color="#1C6E4A" speed={0.6} distort={0.25} scale={2.5} opacity={0.07} />

        {/* Wireframe shapes */}
        <WireframeShape position={[-8,  2, -10]} speed={0.08} />
        <WireframeShape position={[8,  -3, -12]} speed={0.05} />
        <WireframeShape position={[0,  -5, -8]}  speed={0.06} />

        {/* Rotating rings */}
        <RotatingTorus position={[4,   3, -12]} rotation={[0.5, 0.3, 0]} color="#1C6E4A" opacity={0.2} />
        <RotatingTorus position={[-5, -2, -10]} rotation={[0.2, 0.8, 0.3]} color="#A8C686" opacity={0.15} />
        <RotatingTorus position={[0,   6, -15]} rotation={[1.0, 0.2, 0.5]} color="#556B2F" opacity={0.12} />

        {/* Constellation network */}
        <ConstellationLines />

        {/* Grid */}
        <GridPlane />

        {/* Particles */}
        <ParticleField />
      </Canvas>
    </div>
  );
}
