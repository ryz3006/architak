import type { Metadata } from "next";
import Link from "next/link";

import { PageCta } from "@/components/pages/page-cta";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { FeaturedWorkAccordion } from "@/components/motion/featured-work-accordion";
import { HeroChapters } from "@/components/motion/hero-chapters";
import { OptionalThreeMark } from "@/components/motion/optional-three";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SpaceStorySection } from "@/components/motion/space-story";
import { getHeroChapters, getManifesto, getSpaceStory, getStudioPageContent } from "@/content/static";
import { getDriftWallImages } from "@/features/story/drift-images";
import { getFeaturedAccordionItems } from "@/features/work/accordion-items";
import { resolveHeroJourney } from "@/lib/hero/journey";

import "@/styles/home-work.css";

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
  const studioWork = getStudioPageContent().work;
  const studioCta = getStudioPageContent().cta;
  const threeEnabled = process.env.FEATURE_THREE_D === "true";

  return (
    <main id="main-content" className="relative flex min-h-dvh flex-col">
      <SmoothScroll />
      <SiteHeader homeHero />
      <OptionalThreeMark enabled={threeEnabled} />

      <HeroChapters journey={journey} chapters={chapters} />

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <p className="measure max-w-3xl text-fluid-lg text-muted">{manifesto}</p>
          <div className="mt-fluid-md">
            <h2 className="display text-display-md">Selected work</h2>
          </div>
          <FeaturedWorkAccordion items={featuredWork} />
          <footer className="home-work-more">
            <p className="home-work-more__support">{studioWork.support}</p>
            <Link href="/studio#work" className="home-work-more__link">
              Explore the studio
            </Link>
          </footer>
        </section>
      </Reveal>

      <SpaceStorySection story={spaceStory} images={driftImages} />

      <PageCta
        eyebrow={studioCta.eyebrow}
        headline={studioCta.headline}
        support={studioCta.support}
        showContactLink={false}
      />

      <SiteFooter />
    </main>
  );
}
