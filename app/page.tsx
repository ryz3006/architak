import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { OptionalThreeMark } from "@/components/motion/optional-three";
import { Reveal } from "@/components/motion/reveal";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { getStaticSite } from "@/content/static";

export const metadata: Metadata = {
  title: "ARCHITAK — Interiors Studio, Kochi",
  description:
    "CREATED TO CREATE. ARCHITAK is an interiors studio in Vyttila, Kochi crafting residential, hospitality, corporate, and commercial spaces.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ARCHITAK — CREATED TO CREATE",
    description: "Interiors studio based in Kochi. Spatial craft, precise material, lasting presence.",
  },
};

export default function HomePage() {
  const site = getStaticSite();
  const threeEnabled = process.env.FEATURE_THREE_D === "true";

  return (
    <main id="main-content" className="relative flex min-h-dvh flex-col">
      <SmoothScroll />
      <SiteHeader />
      <OptionalThreeMark enabled={threeEnabled} />

      <section
        className="relative w-full"
        style={{ minHeight: "max(var(--hero-height), var(--hero-height-min))" }}
      >
        <Image
          src={site.heroImage}
          alt="ARCHITAK interior design — modern living room"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/20" />
        <div
          className="page-frame relative z-10 flex flex-col justify-end pb-fluid-lg"
          style={{ minHeight: "max(var(--hero-height), var(--hero-height-min))" }}
        >
          <p className="mb-4 text-fluid-sm tracking-[0.35em] text-accent uppercase">
            Kochi · Interiors
          </p>
          <h1 className="display max-w-4xl text-display-xl text-foreground">
            {site.studio.tagline}
          </h1>
          <p className="measure mt-6 text-fluid-lg text-foreground/85">{site.studio.statement}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/work"
              className="border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase"
            >
              View work
            </Link>
            <Link
              href="/contact"
              className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase transition-colors duration-[var(--duration-micro)] hover:border-accent hover:text-accent"
            >
              Enquire
            </Link>
          </div>
        </div>
      </section>

      <Reveal>
        <section className="page-frame py-fluid-xl">
          <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Featured work</p>
          <h2 className="display mt-3 text-display-md">Selected projects</h2>
          <ul className="mt-12 grid gap-fluid-md [grid-template-columns:repeat(auto-fit,minmax(min(18rem,100%),1fr))]">
            {site.featuredProjects.map((project) => (
              <li key={project.slug} className="@container">
                <Link href={`/work/${project.slug}`} className="group block">
                  <div className="relative aspect-4/5 overflow-hidden bg-surface">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-[var(--duration-large)] ease-[var(--ease-standard)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      sizes="(max-width: 48rem) 100vw, (max-width: 80rem) 50vw, 33vw"
                    />
                  </div>
                  <p className="mt-4 text-fluid-xs tracking-widest text-muted uppercase">
                    {project.category} · {project.location}
                  </p>
                  <h3 className="display mt-1 text-fluid-xl @md:text-display-sm">{project.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </Reveal>

      <Reveal>
        <section className="page-frame border-t border-border py-fluid-xl">
          <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">How we work</p>
          <ol className="mt-10 grid gap-fluid-md [grid-template-columns:repeat(auto-fit,minmax(min(16rem,100%),1fr))]">
            {site.studio.process.map((item) => (
              <li key={item.step}>
                <p className="text-accent">{item.step}</p>
                <h3 className="display mt-2 text-fluid-xl">{item.title}</h3>
                <p className="measure-narrow mt-3 text-fluid-sm text-muted">{item.description}</p>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <SiteFooter />
    </main>
  );
}
