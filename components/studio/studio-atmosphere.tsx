"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { useHeavyMotionAllowed, useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-atmosphere.css";

const PixelSnow = dynamic(
  () => import("@/components/motion/pixel-snow").then((mod) => mod.PixelSnow),
  { ssr: false, loading: () => null },
);

export function StudioAtmosphere() {
  const reduced = useReducedMotion();
  const heavyOk = useHeavyMotionAllowed();

  return (
    <div className="studio-atmosphere" aria-hidden="true">
      <div className="studio-atmosphere__base" />
      {!reduced && heavyOk ? (
        <Suspense fallback={null}>
          <PixelSnow
            className="studio-atmosphere__snow"
            color="#c4a574"
            flakeSize={0.01}
            minFlakeSize={1.15}
            pixelResolution={260}
            speed={0.55}
            density={0.16}
            direction={125}
            brightness={0.48}
            variant="round"
          />
        </Suspense>
      ) : null}
      <div className="studio-atmosphere__veil" />
      <div className="studio-atmosphere__glow studio-atmosphere__glow--left" />
      <div className="studio-atmosphere__glow studio-atmosphere__glow--right" />
    </div>
  );
}
