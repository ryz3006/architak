import type { Metadata } from "next";

import { PageCta } from "@/components/pages/page-cta";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { StudioAtmosphere } from "@/components/studio/studio-atmosphere";
import { StudioBridge } from "@/components/studio/studio-bridge";
import { StudioCompliment } from "@/components/studio/studio-compliment";
import { StudioCreates } from "@/components/studio/studio-creates";
import { StudioHero } from "@/components/studio/studio-hero";
import { StudioLocation } from "@/components/studio/studio-location";
import { StudioManifesto } from "@/components/studio/studio-manifesto";
import { StudioProcess } from "@/components/studio/studio-process";
import { StudioReveal } from "@/components/studio/studio-reveal";
import { StudioVoices } from "@/components/studio/studio-voices";
import { StudioFeaturedWorks } from "@/components/studio/studio-featured-works";
import { StudioWorkDome } from "@/components/studio/studio-work-dome";
import { StudioWorkIntro } from "@/components/studio/studio-work-intro";
import {
  getStaticProjects,
  getStudioPageContent,
  getTestimonials,
} from "@/content/static";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { getPageSeo } from "@/features/discovery/page-seo";
import {
  buildBreadcrumbJsonLd,
  buildStudioWorkListJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";
import {
  resolveFeaturedWorkVideos,
  toDepthCarouselItems,
} from "@/features/work/featured-videos";

import "@/styles/studio-page.css";

const studioSeo = getPageSeo("/studio")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/studio",
  title: studioSeo.title,
  description: studioSeo.description,
});

export default async function StudioPage() {
  const page = getStudioPageContent();
  const projects = getStaticProjects();
  const testimonials = getTestimonials();
  const featuredVideos = toDepthCarouselItems(resolveFeaturedWorkVideos());

  return (
    <main id="main-content" className="studio-page flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Studio", path: "/studio" },
          ]),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildStudioWorkListJsonLd())}
      />
      <StudioAtmosphere />
      <SmoothScroll />

      <div className="studio-page__content">
        <SiteHeader />

        <StudioHero hero={page.hero} />

        <StudioReveal variant="center">
          <StudioManifesto manifesto={page.manifesto} />
        </StudioReveal>

        <StudioReveal variant="left">
          <StudioCreates creates={page.creates} />
        </StudioReveal>

        <StudioReveal variant="rise">
          <section id="work" className="studio-work-section border-t border-border">
            <StudioWorkIntro work={page.work} />
            <StudioFeaturedWorks
              eyebrow={page.featuredWorks.eyebrow}
              headline={page.featuredWorks.headline}
              support={page.featuredWorks.support}
              items={featuredVideos}
            />
            <StudioWorkDome projects={projects} />
          </section>
        </StudioReveal>

        <StudioReveal variant="center">
          <StudioBridge lines={page.workBridge.lines} />
        </StudioReveal>

        <StudioReveal variant="right">
          <StudioVoices voices={page.voices} items={testimonials} />
        </StudioReveal>

        <StudioReveal variant="center">
          <StudioCompliment compliment={page.compliment} />
        </StudioReveal>

        <StudioReveal variant="left">
          <StudioProcess process={page.process} />
        </StudioReveal>

        <StudioReveal variant="right">
          <StudioLocation location={page.location} />
        </StudioReveal>

        <PageCta
          eyebrow={page.cta.eyebrow}
          headline={page.cta.headline}
          support={page.cta.support}
          showContactLink={false}
        />

        <SiteFooter />
      </div>
    </main>
  );
}
