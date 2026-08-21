import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticSite } from "@/content/static";

export const metadata: Metadata = {
  title: "ARCHITAK — Interiors Studio, Kochi",
  description:
    "CREATED TO CREATE. ARCHITAK is an interiors studio in Vyttila, Kochi crafting residential, hospitality, corporate, and commercial spaces.",
  openGraph: {
    title: "ARCHITAK — CREATED TO CREATE",
    description: "Interiors studio based in Kochi. Spatial craft, precise material, lasting presence.",
    images: [{ url: "/media/architak-in/2025__03__interior-of-modern-design-living-room-3d-rendering-e1604308696322.jpg" }],
  },
};

export default function HomePage() {
  const site = getStaticSite();

  return (
    <main className="relative flex min-h-screen flex-col">
      <SiteHeader />

      <section className="relative min-h-[85vh] w-full">
        <Image
          src={site.heroImage}
          alt="ARCHITAK interior design — modern living room"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/20" />
        <div className="relative z-10 flex min-h-[85vh] flex-col justify-end px-6 pb-16 md:px-12 md:pb-24">
          <p className="mb-4 text-xs tracking-[0.35em] text-accent uppercase">Kochi · Interiors</p>
          <h1 className="font-display max-w-4xl text-5xl leading-tight text-foreground md:text-7xl">
            {site.studio.tagline}
          </h1>
          <p className="mt-6 max-w-xl text-base text-foreground/85 md:text-lg">
            {site.studio.statement}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/work"
              className="border border-foreground bg-foreground px-6 py-3 text-sm tracking-widest text-background uppercase"
            >
              View work
            </Link>
            <Link
              href="/contact"
              className="border border-border px-6 py-3 text-sm tracking-widest uppercase hover:border-accent hover:text-accent"
            >
              Enquire
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 md:px-12 md:py-28">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">Featured work</p>
        <h2 className="font-display mt-3 text-3xl md:text-5xl">Selected projects</h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-2 xl:grid-cols-3">
          {site.featuredProjects.map((project) => (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <p className="mt-4 text-xs tracking-widest text-muted uppercase">
                  {project.category} · {project.location}
                </p>
                <h3 className="font-display mt-1 text-2xl">{project.title}</h3>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border px-6 py-20 md:px-12">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">How we work</p>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {site.studio.process.map((item) => (
            <li key={item.step}>
              <p className="text-accent">{item.step}</p>
              <h3 className="font-display mt-2 text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm text-muted">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </main>
  );
}
