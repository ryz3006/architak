import type { Metadata } from "next";

import { PageCta } from "@/components/pages/page-cta";
import { PageHero } from "@/components/pages/page-hero";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServicesShowcase } from "@/components/services/services-showcase";
import { getServicesPageContent, getStaticServices } from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import {
  buildBreadcrumbJsonLd,
  buildServiceListJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

export const metadata: Metadata = {
  title: "Services — ARCHITAK | Interior Design Practice",
  description:
    "ARCHITAK services — hospitality, residential, corporate, restaurant, commercial, and industrial interior design in Kochi.",
  alternates: { canonical: absoluteUrl("/services") },
};

export default function ServicesPage() {
  const services = getStaticServices();
  const page = getServicesPageContent();

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildServiceListJsonLd())}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Services", path: "/services" },
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
        imageAlt="ARCHITAK services — modern kitchen interior"
      />

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <ServicesShowcase services={services} />
        </section>
      </Reveal>

      <PageCta headline={page.closing} support={page.closingSupport} />

      <SiteFooter />
    </main>
  );
}
