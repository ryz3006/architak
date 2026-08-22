/** Smooth interpolation helper — no React, safe for rAF scroll readers. */

import type { HeroViewportProfile } from "@/lib/hero/viewport-profile";

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Maps scroll progress 0–1 to chapter weights and layout variables. */
export interface HeroCompositionVars {
  progress: number;
  split: number;
  typeX: number;
  typeY: number;
  typeScale: number;
  typeMaxWidth: number;
  overlayStrength: number;
  release: number;
  expWeight: number;
  spaceWeight: number;
  feelWeight: number;
  expScale: number;
  spaceScale: number;
  feelScale: number;
  activeChapter: number;
}

export function computeHeroComposition(
  progress: number,
  profile: HeroViewportProfile = "wide",
): HeroCompositionVars {
  const p = clamp(progress, 0, 1);
  const vertical = profile === "narrow" || profile === "medium";

  const expWeight = clamp(1 - smoothstep(0.22, 0.38, p), 0, 1);
  const spaceWeight = clamp(smoothstep(0.28, 0.42, p) * (1 - smoothstep(0.52, 0.66, p)), 0, 1);
  const feelWeight = clamp(smoothstep(0.58, 0.72, p), 0, 1);

  const splitStart = vertical ? 0.44 : profile === "ultra" ? 0.38 : 0.4;
  const splitMid = vertical ? 0.36 : profile === "ultra" ? 0.28 : 0.32;
  const splitEnd = vertical ? 0.3 : profile === "ultra" ? 0.2 : 0.24;

  const split = lerp(splitStart, lerp(splitMid, splitEnd, smoothstep(0.4, 0.75, p)), smoothstep(0, 0.75, p));

  const typeX = vertical
    ? lerp(0, 2, smoothstep(0.2, 0.75, p))
    : lerp(0, lerp(3, 12, smoothstep(0.4, 0.8, p)), smoothstep(0.18, 0.8, p));

  const typeY = vertical
    ? lerp(0, 3, smoothstep(0.45, 0.85, p))
    : lerp(0, 6, smoothstep(0.58, 0.85, p));

  const typeScale = lerp(
    1,
    vertical ? 0.94 : lerp(0.96, 0.92, smoothstep(0.4, 0.82, p)),
    smoothstep(0.18, 0.82, p),
  );

  const typeMaxStart = profile === "ultra" ? 38 : vertical ? 28 : 34;
  const typeMaxMid = profile === "ultra" ? 34 : vertical ? 24 : 30;
  const typeMaxEnd = profile === "ultra" ? 30 : vertical ? 20 : 26;
  const typeMaxWidth = lerp(
    typeMaxStart,
    lerp(typeMaxMid, typeMaxEnd, smoothstep(0.4, 0.82, p)),
    smoothstep(0.18, 0.82, p),
  );

  const overlayStrength = lerp(
    vertical ? 0.42 : 0.18,
    lerp(vertical ? 0.58 : 0.38, vertical ? 0.72 : 0.58, smoothstep(0.58, 0.85, p)),
    smoothstep(0.35, 0.85, p),
  );

  const release = smoothstep(0.92, 1, p);

  const expScale = lerp(1, 0.96, smoothstep(0.18, 0.38, p));
  const spaceScale = lerp(0.98, 1.02, smoothstep(0.28, 0.58, p));
  const feelScale = lerp(0.99, 1, 1 - smoothstep(0.82, 0.92, p) * 0.5);

  let activeChapter = 0;
  if (p >= 0.55) activeChapter = 2;
  else if (p >= 0.28) activeChapter = 1;

  return {
    progress: p,
    split,
    typeX,
    typeY,
    typeScale,
    typeMaxWidth,
    overlayStrength,
    release,
    expWeight,
    spaceWeight,
    feelWeight,
    expScale,
    spaceScale,
    feelScale,
    activeChapter,
  };
}
