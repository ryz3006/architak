import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageCta } from "@/components/pages/page-cta";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { ProjectGallery } from "@/components/project/project-gallery";
import { ProjectHero } from "@/components/project/project-hero";
import { ProjectNav } from "@/components/project/project-nav";
import { ProjectSummary } from "@/components/project/project-summary";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { StudioAtmosphere } from "@/components/studio/studio-atmosphere";
import { StudioReveal } from "@/components/studio/studio-reveal";
import {
  getProjectPageContent,
  getStaticProjectBySlug,
  getStaticProjects,
  getStudioPageContent,
} from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import {
  buildBreadcrumbJsonLd,
  buildProjectJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

import "@/styles/project-page.css";
import "@/styles/studio-page.css";

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
    title: `${project.title} — ARCHITAK`,
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

  const pageCopy = getProjectPageContent();
  const studioPage = getStudioPageContent();

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
    <main id="main-content" className="studio-page project-page flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(buildProjectJsonLd(discoveryProject))}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Studio", path: "/studio" },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        )}
      />
      <StudioAtmosphere />
      <SmoothScroll />

      <div className="studio-page__content">
        <SiteHeader />

        <ProjectHero project={project} />

        <StudioReveal variant="center">
          <ProjectSummary eyebrow={pageCopy.summaryEyebrow} summary={project.summary} />
        </StudioReveal>

        <StudioReveal variant="rise">
          <ProjectGallery
            eyebrow={pageCopy.galleryEyebrow}
            title={project.title}
            images={project.gallery}
          />
        </StudioReveal>

        <StudioReveal variant="right">
          <ProjectNav backLabel={pageCopy.backLabel} />
        </StudioReveal>

        <PageCta
          eyebrow={studioPage.cta.eyebrow}
          headline={studioPage.cta.headline}
          support={studioPage.cta.support}
          showContactLink={false}
        />

        <SiteFooter />
      </div>
    </main>
  );
}
