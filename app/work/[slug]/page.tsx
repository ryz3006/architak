import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticProjectBySlug, getStaticProjects } from "@/content/static";

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
    openGraph: {
      title: `${project.title} · ARCHITAK`,
      description: project.summary,
      images: [{ url: project.coverImage }],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getStaticProjectBySlug(slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    image: project.coverImage,
    creator: {
      "@type": "Organization",
      name: "ARCHITAK",
      url: "https://architak.in",
    },
  };

  return (
    <main className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <article>
        <div className="relative min-h-[70vh] w-full">
          <Image
            src={project.coverImage}
            alt={project.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 px-6 pb-12 md:px-12">
            <p className="text-xs tracking-widest text-accent uppercase">
              {project.category} · {project.location}
            </p>
            <h1 className="font-display mt-2 text-4xl md:text-6xl">{project.title}</h1>
          </div>
        </div>

        <div className="px-6 py-16 md:px-12 md:py-20">
          <p className="max-w-2xl text-lg text-muted">{project.summary}</p>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {project.gallery.map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden bg-surface">
                <Image src={src} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            ))}
          </div>
          <p className="mt-12">
            <Link href="/work" className="text-sm tracking-widest uppercase text-muted hover:text-foreground">
              ← All work
            </Link>
          </p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
