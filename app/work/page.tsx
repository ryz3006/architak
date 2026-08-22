import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticProjects } from "@/content/static";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected ARCHITAK interiors — residential, hospitality, corporate, restaurant, and commercial work from Kochi.",
};

export default function WorkPage() {
  const projects = getStaticProjects();

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <section className="page-frame py-fluid-xl">
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Portfolio</p>
        <h1 className="display mt-3 text-display-lg">Selected spaces</h1>
        <p className="measure mt-4 text-muted">
          Residential, hospitality, and commercial work from Kochi.
        </p>
        <ul className="mt-14 grid gap-fluid-lg [grid-template-columns:repeat(auto-fit,minmax(min(24rem,100%),1fr))]">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="group block">
                <div className="relative aspect-3/2 overflow-hidden bg-surface">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-[var(--duration-large)] ease-[var(--ease-standard)] group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    sizes="(max-width: 48rem) 100vw, 50vw"
                  />
                </div>
                <p className="mt-4 text-fluid-xs tracking-widest text-muted uppercase">
                  {project.category} · {project.location}
                </p>
                <h2 className="display mt-1 text-display-sm">{project.title}</h2>
                <p className="measure-narrow mt-2 text-fluid-sm text-muted">{project.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
