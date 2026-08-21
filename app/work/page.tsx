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
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="px-6 py-16 md:px-12 md:py-24">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">Portfolio</p>
        <h1 className="font-display mt-3 text-4xl md:text-6xl">Work</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Project photography mirrored locally so this site remains available and crawlable without
          external media services.
        </p>
        <ul className="mt-14 grid gap-12 md:grid-cols-2">
          {projects.map((project) => (
            <li key={project.slug}>
              <Link href={`/work/${project.slug}`} className="group block">
                <div className="relative aspect-[3/2] overflow-hidden bg-surface">
                  <Image
                    src={project.coverImage}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <p className="mt-4 text-xs tracking-widest text-muted uppercase">
                  {project.category} · {project.location}
                </p>
                <h2 className="font-display mt-1 text-3xl">{project.title}</h2>
                <p className="mt-2 text-sm text-muted">{project.summary}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <SiteFooter />
    </main>
  );
}
