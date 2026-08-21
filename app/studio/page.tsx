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
    <main id="main-content" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <section className="page-frame py-fluid-xl">
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Studio</p>
        <h1 className="display mt-3 max-w-3xl text-display-lg">{studio.tagline}</h1>
        <p className="measure mt-8 text-fluid-lg text-muted">{studio.statement}</p>
        <p className="mt-6 text-fluid-sm text-muted">
          {studio.address}
          <br />
          {studio.location}
        </p>

        <ol className="mt-16 grid gap-fluid-md border-t border-border pt-16 [grid-template-columns:repeat(auto-fit,minmax(min(16rem,100%),1fr))]">
          {studio.process.map((item) => (
            <li key={item.step}>
              <p className="text-accent">{item.step}</p>
              <h2 className="display mt-2 text-fluid-xl">{item.title}</h2>
              <p className="measure-narrow mt-3 text-fluid-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>
      <SiteFooter />
    </main>
  );
}
