"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-atmosphere.css";

const PixelSnow = dynamic(
  () => import("@/components/motion/pixel-snow").then((mod) => mod.PixelSnow),
  { ssr: false, loading: () => null },
);

export function StudioAtmosphere() {
  const reduced = useReducedMotion();

  return (
    <div className="studio-atmosphere" aria-hidden="true">
      <div className="studio-atmosphere__base" />
      {!reduced ? (
        <Suspense fallback={null}>
          <PixelSnow
            className="studio-atmosphere__snow"
            color="#d4b896"
            flakeSize={0.012}
            minFlakeSize={1.45}
            pixelResolution={220}
            speed={0.72}
            density={0.32}
            direction={125}
            brightness={0.92}
            depthFade={7}
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
