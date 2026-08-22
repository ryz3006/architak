import type { Metadata } from "next";
import Link from "next/link";

import { PageCta } from "@/components/pages/page-cta";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { FeaturedWorkReel } from "@/components/work/featured-work-reel";
import { FeaturedWorkAccordion } from "@/components/motion/featured-work-accordion";
import { HeroChapters } from "@/components/motion/hero-chapters";
import { OptionalThreeMark } from "@/components/motion/optional-three";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { SpaceStorySection } from "@/components/motion/space-story";
import { getHeroChapters, getManifesto, getSpaceStory, getStudioPageContent } from "@/content/static";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { getPageSeo } from "@/features/discovery/page-seo";
import {
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";
import { getDriftWallImages } from "@/features/story/drift-images";
import { getFeaturedAccordionItems } from "@/features/work/accordion-items";
import { resolveFeaturedWorkVideos } from "@/features/work/featured-videos";
import { resolveHeroJourney, preloadHeroImageHints } from "@/lib/hero/journey";

import "@/styles/home-work.css";

const homeSeo = getPageSeo("/")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  title: homeSeo.title,
  description: homeSeo.description,
});

export default async function HomePage() {
  const journey = await resolveHeroJourney();
  const chapters = getHeroChapters();
  const manifesto = getManifesto();
  const spaceStory = getSpaceStory();
  const driftImages = getDriftWallImages();
  const featuredWork = await getFeaturedAccordionItems();
  const featuredVideos = resolveFeaturedWorkVideos();
  const studioWork = getStudioPageContent().work;
  const studioCta = getStudioPageContent().cta;
  const threeEnabled = process.env.FEATURE_THREE_D === "true";
  const lcpImage = preloadHeroImageHints(journey)[0]?.src;

  return (
    <>
      {lcpImage ? <link rel="preload" as="image" href={lcpImage} /> : null}
    <main id="main-content" className="relative flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildWebSiteJsonLd())}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildWebPageJsonLd("/", homeSeo.title, homeSeo.description),
        )}
      />
      <h1 className="sr-only">ARCHITAK — Interior Design Studio, Kochi</h1>
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
          <FeaturedWorkReel items={featuredVideos} />
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
    </>
  );
}
