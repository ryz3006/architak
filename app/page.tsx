import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { FeaturedWorkAccordion } from "@/components/motion/featured-work-accordion";
import { HeroChapters } from "@/components/motion/hero-chapters";
import { OptionalThreeMark } from "@/components/motion/optional-three";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getHeroChapters, getManifesto, getStaticSite } from "@/content/static";
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
  const site = getStaticSite();
  const journey = await resolveHeroJourney();
  const chapters = getHeroChapters();
  const manifesto = getManifesto();
  const featuredWork = await getFeaturedAccordionItems();
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
          <h2 className="display mt-fluid-md text-display-md">Work</h2>
          <FeaturedWorkAccordion items={featuredWork} />
        </section>
      </Reveal>

      <Reveal>
        <section className="page-frame border-t border-border py-fluid-xl">
          <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">How a space is made</p>
          <ol className="mt-10 grid gap-fluid-md [grid-template-columns:repeat(auto-fit,minmax(min(16rem,100%),1fr))]">
            {site.studio.process.map((item) => (
              <li key={item.step}>
                <p className="text-accent">{item.step}</p>
                <h3 className="display mt-2 text-fluid-xl">{item.title}</h3>
                <p className="measure-narrow mt-3 text-fluid-sm text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
