import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticProjectBySlug, getStaticProjects } from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import {
  buildBreadcrumbJsonLd,
  buildProjectJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getStaticProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getStaticProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: absoluteUrl(`/work/${project.slug}`) },
    openGraph: {
      title: `${project.title} · ARCHITAK`,
      description: project.summary,
      url: absoluteUrl(`/work/${project.slug}`),
      type: "article",
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getStaticProjectBySlug(slug);
  if (!project) notFound();

  const discoveryProject = {
    slug: project.slug,
    path: `/work/${project.slug}`,
    title: project.title,
    category: project.category,
    location: project.location,
    summary: project.summary,
    coverImage: project.coverImage,
  };

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildProjectJsonLd(discoveryProject))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Work", path: "/work" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        )}
      />
      <SiteHeader />
      <article>
        <div
          className="relative w-full"
          style={{ minHeight: "max(70dvh, var(--hero-height-min))" }}
        >
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="page-frame absolute inset-x-0 bottom-0 pb-fluid-md">
            <p className="text-fluid-xs tracking-widest text-accent uppercase">
              {project.category} · {project.location}
            </p>
            <h1 className="display mt-2 text-display-lg">{project.title}</h1>
          </div>
        </div>

        <div className="page-frame py-fluid-xl">
          <p className="measure text-fluid-lg text-muted">{project.summary}</p>
          <div className="mt-14 grid gap-fluid-sm [grid-template-columns:repeat(auto-fit,minmax(min(22rem,100%),1fr))]">
            {project.gallery.map((src) => (
              <div key={src} className="relative aspect-4/3 overflow-hidden bg-surface">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 48rem) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
          <p className="mt-12">
            <Link
              href="/work"
              className="text-fluid-sm tracking-widest text-muted uppercase hover:text-foreground"
            >
              ← All work
            </Link>
          </p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
