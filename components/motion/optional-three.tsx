"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { useHeavyMotionAllowed, useReducedMotion } from "@/lib/a11y/use-reduced-motion";

const TriangleScene = dynamic(
  () => import("@/components/motion/triangle-scene").then((mod) => mod.TriangleScene),
  { ssr: false, loading: () => null },
);

/**
 * Optional 3D mark behind FEATURE_THREE_D.
 *
 * Defaults off. Never on the critical path. Falls back to nothing when motion
 * is reduced, the device is coarse/low-power, or WebGL is unavailable.
 */
export function OptionalThreeMark({ enabled = false }: { enabled?: boolean }) {
  const reduced = useReducedMotion();
  const heavyOk = useHeavyMotionAllowed();

  if (!enabled || reduced || !heavyOk) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[40vh] opacity-40"
    >
      <Suspense fallback={null}>
        <TriangleScene />
      </Suspense>
    </div>
  );
}
