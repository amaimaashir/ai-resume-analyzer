// src/components/three/HeroScene.tsx
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// Floating geometric shape
function FloatingShape({
  position,
  color,
  speed = 1,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  speed?: number;
  scale?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * speed * 0.3) * 0.3;
    meshRef.current.rotation.y =
      state.clock.elapsedTime * speed * 0.2;
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={color}
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </Float>
  );
}

// Particle field
function Particles() {
  const count = 1500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 30;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 30;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y =
      state.clock.elapsedTime * 0.03;
    pointsRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.02) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#A8C686"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Central glowing orb
function CentralOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <Sphere args={[1.4, 64, 64]}>
        <MeshDistortMaterial
          color="#1C6E4A"
          distort={0.4}
          speed={1.5}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </mesh>
  );
}

// Orbiting ring
function OrbitRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.x = state.clock.elapsedTime * 0.4;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={ringRef} position={[0, 0, 0]}>
      <torusGeometry args={[2.2, 0.03, 16, 100]} />
      <meshStandardMaterial
        color="#A8C686"
        transparent
        opacity={0.5}
        emissive="#A8C686"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} color="#0D1F1A" />
        <pointLight
          position={[5, 5, 5]}
          intensity={2}
          color="#1C6E4A"
        />
        <pointLight
          position={[-5, -3, -5]}
          intensity={1}
          color="#A8C686"
        />
        <spotLight
          position={[0, 8, 0]}
          intensity={1.5}
          color="#2A8F62"
          angle={0.4}
        />

        {/* Scene elements */}
        <Stars
          radius={80}
          depth={50}
          count={3000}
          factor={3}
          saturation={0}
          fade
          speed={0.5}
        />
        <Particles />
        <CentralOrb />
        <OrbitRing />

        {/* Floating shapes */}
        <FloatingShape
          position={[-4, 2, -2]}
          color="#1C6E4A"
          speed={0.8}
          scale={0.7}
        />
        <FloatingShape
          position={[4, -1, -3]}
          color="#556B2F"
          speed={1.2}
          scale={0.5}
        />
        <FloatingShape
          position={[-3, -2, -1]}
          color="#9cc66cff"
          speed={0.6}
          scale={0.4}
        />
        <FloatingShape
          position={[3, 3, -2]}
          color="#50e5a2ff"
          speed={1.0}
          scale={0.6}
        />
        <FloatingShape
          position={[0, -3.5, -1]}
          color="#1C6E4A"
          speed={0.9}
          scale={0.35}
        />
      </Canvas>
    </div>
  );
}