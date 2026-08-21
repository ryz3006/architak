import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticServices } from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import {
  buildBreadcrumbJsonLd,
  buildServiceListJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

export const metadata: Metadata = {
  title: "Services",
  description:
    "ARCHITAK services — hospitality, residential, corporate, restaurant, commercial, and industrial interior design in Kochi.",
  alternates: { canonical: absoluteUrl("/services") },
};

export default function ServicesPage() {
  const services = getStaticServices();

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
      <SiteHeader />
      <section className="page-frame py-fluid-xl">
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Practice</p>
        <h1 className="display mt-3 text-display-lg">Services</h1>
        <ul className="mt-14 divide-y divide-border border-y border-border">
          {services.map((service) => (
            <li key={service.slug} className="grid gap-3 py-8 md:grid-cols-[1fr_2fr]">
              <h2 className="display text-fluid-xl">{service.title}</h2>
              <p className="measure text-muted">{service.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-12">
          <Link
            href="/contact"
            className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase transition-colors duration-[var(--duration-micro)] hover:border-accent"
          >
            Start a project
          </Link>
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
