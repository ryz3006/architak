import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { FeaturedWorkAccordion } from "@/components/motion/featured-work-accordion";
import { HeroChapters } from "@/components/motion/hero-chapters";
import { OptionalSplashCursor } from "@/components/motion/optional-splash-cursor";
import { OptionalThreeMark } from "@/components/motion/optional-three";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SpaceStorySection } from "@/components/motion/space-story";
import { getHeroChapters, getManifesto, getSpaceStory } from "@/content/static";
import { getDriftWallImages } from "@/features/story/drift-images";
import { getFeaturedAccordionItems } from "@/features/work/accordion-items";
import { resolveHeroJourney } from "@/lib/hero/journey";

export const metadata: Metadata = {
  title: "ARCHITAK — Created to Create | Interior Design, Kochi",
  description:
    "CREATED TO CREATE. Interior design studio in Vyttila, Kochi — residential, hospitality, corporate, and commercial spaces that become part of how you live.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ARCHITAK — CREATED TO CREATE",
    description:
      "We create experiences, spaces, and feel — interior design studio in Kochi.",
  },
};

export default async function HomePage() {
  const journey = await resolveHeroJourney();
  const chapters = getHeroChapters();
  const manifesto = getManifesto();
  const spaceStory = getSpaceStory();
  const driftImages = getDriftWallImages();
  const featuredWork = await getFeaturedAccordionItems();
  const threeEnabled = process.env.FEATURE_THREE_D === "true";
  const splashCursorEnabled = process.env.FEATURE_SPLASH_CURSOR !== "false";

  return (
    <main id="main-content" className="relative flex min-h-dvh flex-col">
      <SmoothScroll />
      <OptionalSplashCursor enabled={splashCursorEnabled} />
      <SiteHeader homeHero />
      <OptionalThreeMark enabled={threeEnabled} />

      <HeroChapters journey={journey} chapters={chapters} />

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <p className="measure max-w-3xl text-fluid-lg text-muted">{manifesto}</p>
          <div className="mt-fluid-md flex flex-wrap items-end justify-between gap-4">
            <h2 className="display text-display-md">Selected work</h2>
            <a
              href="/studio#work"
              className="text-fluid-sm tracking-widest text-muted uppercase transition-colors duration-[var(--duration-micro)] hover:text-accent"
            >
              View studio
            </a>
          </div>
          <FeaturedWorkAccordion items={featuredWork} />
        </section>
      </Reveal>

      <SpaceStorySection story={spaceStory} images={driftImages} />

      <SiteFooter />
    </main>
  );
}
