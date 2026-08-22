/** Smooth interpolation helper — no React, safe for rAF scroll readers. */

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
  ctaOpacity: number;
  release: number;
  stillness: number;
  expWeight: number;
  spaceWeight: number;
  feelWeight: number;
  expScale: number;
  spaceScale: number;
  feelScale: number;
  activeChapter: number;
  progress01: number;
  progress02: number;
  progress03: number;
}

export function computeHeroComposition(progress: number): HeroCompositionVars {
  const p = clamp(progress, 0, 1);

  const expWeight = clamp(1 - smoothstep(0.22, 0.38, p), 0, 1);
  const spaceWeight = clamp(smoothstep(0.28, 0.42, p) * (1 - smoothstep(0.52, 0.66, p)), 0, 1);
  const feelWeight = clamp(smoothstep(0.58, 0.72, p), 0, 1);

  /*
   * Dominance shifts from text-led to image-led. The type column never drops
   * below a readable share, and the panel only drifts far enough to sit on the
   * image seam — further would clip the display line against the gutter.
   */
  const split = lerp(0.4, lerp(0.32, 0.24, smoothstep(0.4, 0.75, p)), smoothstep(0, 0.75, p));
  const typeX = lerp(0, lerp(3, 12, smoothstep(0.4, 0.8, p)), smoothstep(0.18, 0.8, p));
  const typeY = lerp(0, 6, smoothstep(0.58, 0.85, p));
  const typeScale = lerp(1, lerp(0.96, 0.92, smoothstep(0.4, 0.82, p)), smoothstep(0.18, 0.82, p));
  const typeMaxWidth = lerp(34, lerp(30, 26, smoothstep(0.4, 0.82, p)), smoothstep(0.18, 0.82, p));
  const overlayStrength = lerp(0.18, lerp(0.38, 0.58, smoothstep(0.58, 0.85, p)), smoothstep(0.35, 0.85, p));

  const ctaOpacity = clamp(1 - smoothstep(0.18, 0.32, p), 0, 1);
  const stillness = smoothstep(0.82, 0.92, p) * (1 - smoothstep(0.92, 1, p));
  const release = smoothstep(0.92, 1, p);

  const expScale = lerp(1, 0.96, smoothstep(0.18, 0.38, p));
  const spaceScale = lerp(0.98, 1.02, smoothstep(0.28, 0.58, p));
  const feelScale = lerp(0.99, 1, 1 - stillness * 0.5);

  let activeChapter = 0;
  if (p >= 0.55) activeChapter = 2;
  else if (p >= 0.28) activeChapter = 1;

  const progress01 = activeChapter === 0 ? 1 : 0.35;
  const progress02 = activeChapter === 1 ? 1 : 0.35;
  const progress03 = activeChapter === 2 ? 1 : 0.35;

  return {
    progress: p,
    split,
    typeX,
    typeY,
    typeScale,
    typeMaxWidth,
    overlayStrength,
    ctaOpacity,
    release,
    stillness,
    expWeight,
    spaceWeight,
    feelWeight,
    expScale,
    spaceScale,
    feelScale,
    activeChapter,
    progress01,
    progress02,
    progress03,
  };
}
