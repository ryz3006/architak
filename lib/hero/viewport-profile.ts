export type HeroViewportProfile = "narrow" | "medium" | "wide" | "ultra";

/** Scroll track length per profile — enough runway for three chapter beats on touch. */
export const HERO_TRACK_VH: Record<HeroViewportProfile, number> = {
  narrow: 320,
  medium: 335,
  wide: 340,
  ultra: 350,
};

/**
 * Maps the live viewport to a hero layout profile.
 * Foldables unfolded (≈717–882px), tablets, laptops, and 4K each get tuned math.
 */
export function getHeroViewportProfile(width: number, height: number): HeroViewportProfile {
  if (width >= 2560) return "ultra";
  if (width >= 1024) return "wide";
  if (width >= 768) return "medium";
  if (width >= 480 && width > height) return "medium";
  return "narrow";
}

export function heroUsesMobileFocus(profile: HeroViewportProfile, width: number, height: number): boolean {
  if (profile === "narrow") return true;
  if (profile === "medium" && height >= width) return true;
  return false;
}
