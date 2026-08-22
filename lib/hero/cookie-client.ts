import {
  HERO_JOURNEY_COOKIE,
  HERO_JOURNEY_COOKIE_MAX_AGE,
  isHeroJourneyId,
} from "@/lib/hero/constants";

/** Client fallback when the proxy did not run (e.g. some local dev paths). */
export function persistHeroJourneyCookie(journeyId: string): void {
  if (!isHeroJourneyId(journeyId)) return;
  document.cookie = `${HERO_JOURNEY_COOKIE}=${journeyId}; path=/; max-age=${HERO_JOURNEY_COOKIE_MAX_AGE}; samesite=lax`;
}
