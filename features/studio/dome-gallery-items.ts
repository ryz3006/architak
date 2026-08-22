import { getHeroImages, type StaticProject } from "@/content/static";

export type DomeGalleryItem = {
  src: string;
  alt: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  href: string;
};

/**
 * Builds dome tiles from project metadata with hero stills as reliable image sources.
 * Project covers and gallery paths are included when available for richer variety.
 */
export function getStudioDomeGalleryItems(projects: StaticProject[]): DomeGalleryItem[] {
  const heroes = getHeroImages();
  const seen = new Set<string>();
  const items: DomeGalleryItem[] = [];

  const push = (src: string, alt: string, project: StaticProject) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    items.push({
      src,
      alt,
      title: project.title,
      category: project.category,
      location: project.location,
      summary: project.summary,
      href: `/work/${project.slug}`,
    });
  };

  projects.forEach((project, index) => {
    const hero = heroes[index % heroes.length];
    if (hero) {
      push(hero.src, hero.alt, project);
    }

    push(project.coverImage, `${project.title} — ${project.category}`, project);

    for (const src of project.gallery) {
      push(src, `${project.title} interior detail`, project);
    }
  });

  return items;
}
