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
import { getProjectPageContent, getStaticProjects, getStudioPageContent } from "@/content/static";
import { resolvePublishedProject, resolvePublishedProjects } from "@/features/content/resolver";
import { buildPageMetadata } from "@/features/discovery/metadata";
import {
  buildBreadcrumbJsonLd,
  buildProjectJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

import "@/styles/project-page.css";
import "@/styles/studio-page.css";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const projects = await resolvePublishedProjects();
    if (projects.length > 0) {
      return projects.map((project) => ({ slug: project.slug }));
    }
  } catch {
    // fall through
  }
  return getStaticProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await resolvePublishedProject(slug);
  if (!project) return {};

  return buildPageMetadata({
    path: `/work/${project.slug}`,
    title: project.title,
    description: project.summary,
    ogType: "article",
  });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await resolvePublishedProject(slug);
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

  const viewProject = {
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location,
    summary: project.summary,
    coverImage: project.coverImage,
    gallery: project.gallery,
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

        <ProjectHero project={viewProject} />

        <StudioReveal variant="center">
          <ProjectSummary eyebrow={pageCopy.summaryEyebrow} summary={project.summary} />
        </StudioReveal>

        <StudioReveal variant="rise">
          <ProjectGallery
            eyebrow={pageCopy.galleryEyebrow}
            title={project.title}
            images={project.gallery}
            projectTitle={project.title}
            category={project.category}
            location={project.location}
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
