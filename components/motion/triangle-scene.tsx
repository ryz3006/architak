"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Mark() {
  const ref = useRef<Mesh>(null);

  return (
    <mesh
      ref={ref}
      rotation={[0.4, 0.6, 0]}
      onBeforeRender={() => {
        if (ref.current) ref.current.rotation.y += 0.003;
      }}
    >
      <coneGeometry args={[1.1, 1.6, 3]} />
      <meshStandardMaterial color="#c4a574" metalness={0.2} roughness={0.45} />
    </mesh>
  );
}

/**
 * Minimal brand triangle. Kept tiny and tree-shaken — no drei helpers imported
 * so the optional 3D path stays as light as possible.
 */
export function TriangleScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} />
      <Mark />
    </Canvas>
  );
}
