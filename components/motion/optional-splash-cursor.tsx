"use client";

import dynamic from "next/dynamic";

import { useHeavyMotionAllowed, useReducedMotion } from "@/lib/a11y/use-reduced-motion";

const SplashCursor = dynamic(
  () => import("@/components/motion/splash-cursor").then((mod) => mod.SplashCursor),
  { ssr: false, loading: () => null },
);

type OptionalSplashCursorProps = {
  enabled?: boolean;
};

/**
 * Fluid cursor trail — desktop only, fine pointer, motion allowed.
 * Never blocks interaction (pointer-events: none on canvas overlay).
 */
export function OptionalSplashCursor({ enabled = true }: OptionalSplashCursorProps) {
  const reduced = useReducedMotion();
  const heavyOk = useHeavyMotionAllowed();

  if (!enabled || reduced || !heavyOk) {
    return null;
  }

  return (
    <SplashCursor
      DENSITY_DISSIPATION={8}
      VELOCITY_DISSIPATION={4}
      PRESSURE={0.15}
      CURL={6}
      SPLAT_RADIUS={0.43}
      SPLAT_FORCE={4000}
      COLOR_UPDATE_SPEED={4}
      RAINBOW_MODE={false}
      COLOR="#c4a574"
    />
  );
}
