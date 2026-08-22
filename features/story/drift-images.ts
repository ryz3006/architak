import "server-only";

import { getHeroImages, getStaticProjects } from "@/content/static";

export type DriftWallItem = {
  image: string;
  alt: string;
};

const MAX_DRIFT_IMAGES = 24;

/**
 * Derived archive for the process-section Drift Wall.
 * Pulls from featured project covers/galleries and hero stills — no duplicate paths.
 */
export function getDriftWallImages(): DriftWallItem[] {
  const seen = new Set<string>();
  const items: DriftWallItem[] = [];

  const push = (image: string, alt: string) => {
    if (seen.has(image) || items.length >= MAX_DRIFT_IMAGES) return;
    seen.add(image);
    items.push({ image, alt });
  };

  for (const project of getStaticProjects()) {
    push(project.coverImage, `${project.title} — ${project.category}`);
    for (const src of project.gallery) {
      push(src, `${project.title} interior detail`);
    }
  }

  for (const hero of getHeroImages()) {
    push(hero.src, hero.alt);
  }

  return items;
}
