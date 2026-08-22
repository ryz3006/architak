"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

const SplashCursor = dynamic(
  () => import("@/components/motion/splash-cursor").then((mod) => mod.SplashCursor),
  { ssr: false, loading: () => null },
);

type OptionalSplashCursorProps = {
  enabled?: boolean;
};

/**
 * Fluid pointer trail for mouse and touch.
 * Never blocks interaction (pointer-events: none on canvas overlay).
 */
export function OptionalSplashCursor({ enabled = true }: OptionalSplashCursorProps) {
  const reduced = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!enabled || reduced) {
    return null;
  }

  return (
    <SplashCursor
      DENSITY_DISSIPATION={coarsePointer ? 7 : 8}
      VELOCITY_DISSIPATION={coarsePointer ? 3.5 : 4}
      PRESSURE={0.15}
      CURL={6}
      SPLAT_RADIUS={coarsePointer ? 0.55 : 0.43}
      SPLAT_FORCE={coarsePointer ? 5600 : 4000}
      COLOR_UPDATE_SPEED={coarsePointer ? 5 : 4}
      RAINBOW_MODE={false}
      COLOR="#c4a574"
    />
  );
}
