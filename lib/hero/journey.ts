import { cookies } from "next/headers";

import {
  getHeroImageById,
  getHeroJourneyById,
  getHeroJourneys,
  type HeroImage,
  type HeroJourneyResolved,
} from "@/content/static";

const COOKIE_NAME = "architak-hero-journey";
const COOKIE_MAX_AGE = 86_400;

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

function pickRandomJourneyId(): string {
  const journeys = getHeroJourneys();
  const index = Math.floor(Math.random() * journeys.length);
  return journeys[index]?.id ?? journeys[0]!.id;
}

/**
 * Resolves the hero journey for this request.
 *
 * Server picks (or reuses) a journey id via cookie so SSR and client agree on
 * the same three images — no hydration flash.
 */
export async function resolveHeroJourney(): Promise<HeroJourneyResolved> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_NAME)?.value;

  let journeyId = stored ?? "";
  let resolved = journeyId ? resolveJourneyImages(journeyId) : null;

  if (!resolved) {
    journeyId = pickRandomJourneyId();
    resolved = resolveJourneyImages(journeyId);
    if (!resolved) {
      journeyId = getHeroJourneys()[0]!.id;
      resolved = resolveJourneyImages(journeyId)!;
    }

    cookieStore.set(COOKIE_NAME, journeyId, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false,
    });
  }

  return resolved;
}

export function preloadHeroImageHints(journey: HeroJourneyResolved): HeroImage[] {
  return [journey.experience, journey.space, journey.feel];
}
