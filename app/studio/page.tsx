import type { Metadata } from "next";

import { PageCta } from "@/components/pages/page-cta";
import { PageHero } from "@/components/pages/page-hero";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { StudioWorkDome } from "@/components/studio/studio-work-dome";
import { TestimonialsSection } from "@/components/studio/testimonials-section";
import {
  getStaticProjects,
  getStaticSite,
  getStudioPageContent,
  getTestimonials,
} from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/discovery/structured-data";

export const metadata: Metadata = {
  title: "Studio — ARCHITAK | Work, Voices & Practice",
  description:
    "ARCHITAK studio in Vyttila, Kochi — selected interiors, client voices, and the practice behind spaces that feel inevitable.",
  alternates: { canonical: absoluteUrl("/studio") },
};

export default async function StudioPage() {
  const { studio } = getStaticSite();
  const page = getStudioPageContent();
  const projects = getStaticProjects();
  const testimonials = getTestimonials();

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Studio", path: "/studio" },
          ]),
        )}
      />
      <SmoothScroll />
      <SiteHeader />

      <PageHero
        eyebrow={page.eyebrow}
        headline={page.headline}
        support={page.support}
        image={page.heroImage}
        imageAlt="ARCHITAK studio — commercial lobby interior"
      />

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <p className="measure max-w-3xl text-fluid-lg text-muted">{studio.statement}</p>
          <p className="measure mt-6 text-fluid-sm text-muted">
            {studio.address}
            <br />
            {studio.location}
          </p>
        </section>
      </Reveal>

      <Reveal>
        <section id="work" className="studio-work-section border-t border-border">
          <div className="page-frame py-fluid-xl pb-fluid-md">
            <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">{page.workHeading}</p>
            <p className="measure mt-4 max-w-2xl text-muted">{page.workSupport}</p>
          </div>

          <StudioWorkDome projects={projects} />
        </section>
      </Reveal>

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <TestimonialsSection
            heading={page.voicesHeading}
            support={page.voicesSupport}
            items={testimonials}
          />
        </section>
      </Reveal>

      <Reveal>
        <section className="page-frame border-t border-border py-fluid-xl">
          <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Process</p>
          <ol className="mt-10 grid gap-fluid-md [grid-template-columns:repeat(auto-fit,minmax(min(16rem,100%),1fr))]">
            {studio.process.map((item) => (
              <li key={item.step}>
                <p className="text-accent">{item.step}</p>
                <h2 className="display mt-2 text-fluid-xl">{item.title}</h2>
                <p className="measure-narrow mt-3 text-fluid-sm text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <PageCta
        headline="Ready to shape your space?"
        support="Share how you live, work, or host. We will listen before we draw."
      />

      <SiteFooter />
    </main>
  );
}
