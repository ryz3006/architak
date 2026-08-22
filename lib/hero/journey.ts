import { cookies, headers } from "next/headers";

import {
  getHeroImageById,
  getHeroJourneyById,
  getHeroJourneys,
  type HeroImage,
  type HeroJourneyResolved,
} from "@/content/static";
import {
  HERO_JOURNEY_COOKIE,
  HERO_JOURNEY_HEADER,
  isHeroJourneyId,
  pickRandomHeroJourneyId,
} from "@/lib/hero/constants";

function resolveJourneyImages(journeyId: string): HeroJourneyResolved | null {
  const journey = getHeroJourneyById(journeyId);
  if (!journey) return null;

  const experience = getHeroImageById(journey.experience);
  const space = getHeroImageById(journey.space);
  const feel = getHeroImageById(journey.feel);
  if (!experience || !space || !feel) return null;

  const ids = new Set([experience.id, space.id, feel.id]);
  if (ids.size !== 3) return null;

  return {
    id: journey.id,
    experience,
    space,
    feel,
  };
}

/**
 * Resolves the hero journey for this request (read-only).
 *
 * The cookie is set by `proxy.ts` on `/`, which also forwards the chosen id on
 * a request header so the homepage can read it on the first visit.
 */
export async function resolveHeroJourney(): Promise<HeroJourneyResolved> {
  const headerStore = await headers();
  const cookieStore = await cookies();

  const fromHeader = headerStore.get(HERO_JOURNEY_HEADER) ?? undefined;
  const fromCookie = cookieStore.get(HERO_JOURNEY_COOKIE)?.value;

  let journeyId: string = isHeroJourneyId(fromHeader)
    ? fromHeader
    : isHeroJourneyId(fromCookie)
      ? fromCookie
      : pickRandomHeroJourneyId();

  let resolved = resolveJourneyImages(journeyId);

  if (!resolved) {
    journeyId = getHeroJourneys()[0]!.id;
    resolved = resolveJourneyImages(journeyId)!;
  }

  return resolved;
}

export function preloadHeroImageHints(journey: HeroJourneyResolved): HeroImage[] {
  return [journey.experience, journey.space, journey.feel];
}
