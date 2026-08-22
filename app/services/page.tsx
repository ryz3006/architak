import type { Metadata } from "next";

import { PageCta } from "@/components/pages/page-cta";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { ServicesDisciplines } from "@/components/services/services-disciplines";
import { ServicesHero } from "@/components/services/services-hero";
import { StudioAtmosphere } from "@/components/studio/studio-atmosphere";
import { StudioBridge } from "@/components/studio/studio-bridge";
import { StudioCompliment } from "@/components/studio/studio-compliment";
import { StudioManifesto } from "@/components/studio/studio-manifesto";
import { StudioProcess } from "@/components/studio/studio-process";
import { StudioReveal } from "@/components/studio/studio-reveal";
import { StudioWorkIntro } from "@/components/studio/studio-work-intro";
import { getServicesPageContent, getStaticServices } from "@/content/static";
import { buildPageMetadata } from "@/features/discovery/metadata";
import { getPageSeo } from "@/features/discovery/page-seo";
import {
  buildBreadcrumbJsonLd,
  buildServiceListJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

import "@/styles/services-page.css";
import "@/styles/studio-page.css";

const servicesSeo = getPageSeo("/services")!;

export const metadata: Metadata = buildPageMetadata({
  path: "/services",
  title: servicesSeo.title,
  description: servicesSeo.description,
});

export default function ServicesPage() {
  const services = getStaticServices();
  const page = getServicesPageContent();

  return (
    <main id="main-content" className="studio-page services-page flex min-h-dvh flex-col">
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
      <StudioAtmosphere />
      <SmoothScroll />

      <div className="studio-page__content">
        <SiteHeader />

        <ServicesHero hero={page.hero} />

        <StudioReveal variant="center">
          <StudioManifesto manifesto={page.manifesto} />
        </StudioReveal>

        <StudioReveal variant="right">
          <StudioWorkIntro work={page.disciplines} />
        </StudioReveal>

        <StudioReveal variant="rise">
          <ServicesDisciplines services={services} />
        </StudioReveal>

        <StudioReveal variant="center">
          <StudioBridge lines={page.bridge.lines} />
        </StudioReveal>

        <StudioReveal variant="left">
          <StudioProcess process={page.approach} />
        </StudioReveal>

        <StudioReveal variant="center">
          <StudioCompliment compliment={page.compliment} />
        </StudioReveal>

        <PageCta
          eyebrow={page.cta.eyebrow}
          headline={page.cta.headline}
          support={page.cta.support}
        />

        <SiteFooter />
      </div>
    </main>
  );
}
