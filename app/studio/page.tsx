import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticSite } from "@/content/static";

export const metadata: Metadata = {
  title: "Studio",
  description:
    "ARCHITAK studio — interiors practice in Vyttila, Kochi. Concept, design, and development with craft and precision.",
};

export default function StudioPage() {
  const { studio } = getStaticSite();

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="px-6 py-16 md:px-12 md:py-24">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">Studio</p>
        <h1 className="font-display mt-3 max-w-3xl text-4xl md:text-6xl">{studio.tagline}</h1>
        <p className="mt-8 max-w-2xl text-lg text-muted">{studio.statement}</p>
        <p className="mt-6 text-sm text-muted">
          {studio.address}
          <br />
          {studio.location}
        </p>

        <ol className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
          {studio.process.map((item) => (
            <li key={item.step}>
              <p className="text-accent">{item.step}</p>
              <h2 className="font-display mt-2 text-2xl">{item.title}</h2>
              <p className="mt-3 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <SiteFooter />
    </main>
  );
}
