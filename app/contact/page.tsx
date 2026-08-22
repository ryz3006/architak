import type { Metadata } from "next";

import { ContactConnect } from "@/components/contact/contact-connect";
import { ContactHero } from "@/components/contact/contact-hero";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { StudioAtmosphere } from "@/components/studio/studio-atmosphere";
import { StudioBridge } from "@/components/studio/studio-bridge";
import { StudioLocation } from "@/components/studio/studio-location";
import { StudioReveal } from "@/components/studio/studio-reveal";
import { getContactPageContent, getStaticSite, getStudioPageContent } from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import { buildBreadcrumbJsonLd, jsonLdScript } from "@/features/discovery/structured-data";

import "@/styles/contact-page.css";
import "@/styles/studio-page.css";

export const metadata: Metadata = {
  title: "Contact — ARCHITAK | Let's Connect",
  description:
    "Contact ARCHITAK in Vyttila, Kochi — phone, email, WhatsApp, and project enquiry. Every space starts with a conversation.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  const { studio } = getStaticSite();
  const page = getContactPageContent();
  const studioPage = getStudioPageContent();

  return (
    <main id="main-content" className="studio-page contact-page flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />
      <StudioAtmosphere />
      <SmoothScroll />

      <div className="studio-page__content">
        <SiteHeader />

        <ContactHero hero={page.hero} />

        <StudioReveal variant="center">
          <StudioBridge lines={page.bridge.lines} />
        </StudioReveal>

        <StudioReveal variant="left">
          <ContactConnect
            channels={page.channels}
            form={page.form}
            phone={studio.phone}
            email={studio.email}
            address={studio.address}
          />
        </StudioReveal>

        <StudioReveal variant="right">
          <StudioLocation location={studioPage.location} />
        </StudioReveal>

        <SiteFooter />
      </div>
    </main>
  );
}
