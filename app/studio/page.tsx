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
import { getStaticProjects } from "@/content/static";
import { getStudioPageContent, getTestimonials } from "@/features/content/site-content";
import { resolvePublishedProjects, fillToMinimum } from "@/features/content/resolver";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { getPageSeoFromCms } from "@/features/discovery/page-seo-cms";
import {
  buildBreadcrumbJsonLd,
  buildStudioWorkListJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";
import {
  resolveFeaturedWorkVideosFromCms,
  toDepthCarouselItems,
} from "@/features/work/featured-videos";
import { getPublicWebsiteSectionConfig } from "@/features/website/public";
import { listEnabledProjectTestimonials } from "@/features/projects/testimonials";

import "@/styles/studio-page.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const studioSeo = await getPageSeoFromCms("/studio");
  return buildPageMetadata({
    path: "/studio",
    title: studioSeo.title,
    description: studioSeo.description,
  });
}

export default async function StudioPage() {
  const page = await getStudioPageContent();
  const config = await getPublicWebsiteSectionConfig();
  const resolved = await resolvePublishedProjects();

  const ordered =
    config.studioDomeSlugs.length > 0
      ? config.studioDomeSlugs
          .map((slug) => resolved.find((p) => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
      : resolved;

  const projects =
    ordered.length > 0
      ? fillToMinimum(
          ordered.map((p) => ({
            slug: p.slug,
            title: p.title,
            category: p.category,
            location: p.location,
            summary: p.summary,
            coverImage: p.coverImage,
            gallery: p.gallery,
          })),
          8,
        )
      : getStaticProjects();

  const cmsTestimonials = await listEnabledProjectTestimonials();
  const testimonials = cmsTestimonials.length > 0 ? cmsTestimonials : await getTestimonials();
  const featuredVideos = toDepthCarouselItems(await resolveFeaturedWorkVideosFromCms());

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
            {config.featuredWorksEnabled ? (
              <StudioFeaturedWorks
                eyebrow={page.featuredWorks.eyebrow}
                headline={page.featuredWorks.headline}
                support={page.featuredWorks.support}
                items={featuredVideos}
              />
            ) : null}
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
