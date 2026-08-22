export const HERO_JOURNEY_COOKIE = "architak-hero-journey";
export const HERO_JOURNEY_COOKIE_MAX_AGE = 86_400;
export const HERO_JOURNEY_HEADER = "x-hero-journey";

/** Keep in sync with content/static/site.json heroJourneys[].id */
export const HERO_JOURNEY_IDS = [
  "journey-01",
  "journey-02",
  "journey-03",
  "journey-04",
  "journey-05",
  "journey-06",
] as const;

export type HeroJourneyId = (typeof HERO_JOURNEY_IDS)[number];

export function isHeroJourneyId(value: string | undefined): value is HeroJourneyId {
  return HERO_JOURNEY_IDS.includes(value as HeroJourneyId);
}

export function pickRandomHeroJourneyId(): HeroJourneyId {
  const index = Math.floor(Math.random() * HERO_JOURNEY_IDS.length);
  return HERO_JOURNEY_IDS[index] ?? HERO_JOURNEY_IDS[0];
}
