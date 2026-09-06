"use client";

import { OptionalSplashCursor } from "@/components/motion/optional-splash-cursor";
import { TrafficBeacon } from "@/components/analytics/traffic-beacon";

type SiteEffectsProps = {
  splashCursorEnabled?: boolean;
};

/**
 * Global client affordances for the public site: motion cursor + traffic beacon.
 * Mounted once from the root layout.
 */
export function SiteEffects({ splashCursorEnabled = true }: SiteEffectsProps) {
  return (
    <>
      <OptionalSplashCursor enabled={splashCursorEnabled} />
      <TrafficBeacon />
    </>
  );
}
