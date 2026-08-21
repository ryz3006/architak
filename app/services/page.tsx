import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticServices } from "@/content/static";

export const metadata: Metadata = {
  title: "Services",
  description:
    "ARCHITAK services — hospitality, residential, corporate, restaurant, commercial, and industrial interior design in Kochi.",
};

export default function ServicesPage() {
  const services = getStaticServices();

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="px-6 py-16 md:px-12 md:py-24">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">Practice</p>
        <h1 className="font-display mt-3 text-4xl md:text-6xl">Services</h1>
        <ul className="mt-14 divide-y divide-border border-y border-border">
          {services.map((service) => (
            <li key={service.slug} className="grid gap-3 py-8 md:grid-cols-[1fr_2fr]">
              <h2 className="font-display text-2xl">{service.title}</h2>
              <p className="text-muted">{service.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-12">
          <Link
            href="/contact"
            className="border border-border px-6 py-3 text-sm tracking-widest uppercase hover:border-accent"
          >
            Start a project
          </Link>
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
