"use client";

import { OptionalSplashCursor } from "@/components/motion/optional-splash-cursor";

type SiteEffectsProps = {
  splashCursorEnabled?: boolean;
};

/**
 * Global motion affordances — fluid cursor trail on public pages.
 * Mounted once from the root layout so every route shares the same effect.
 */
export function SiteEffects({ splashCursorEnabled = true }: SiteEffectsProps) {
  return <OptionalSplashCursor enabled={splashCursorEnabled} />;
}
