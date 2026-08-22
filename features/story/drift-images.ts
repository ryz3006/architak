import "server-only";

import { getHeroImages, getStaticProjects } from "@/content/static";

export type DriftWallItem = {
  image: string;
  title?: string;
  href?: string;
};

const MAX_DRIFT_IMAGES = 15;

/**
 * Derived archive for the process-section Drift Wall.
 * Hero stills are listed first (always mirrored locally); project covers follow.
 */
export function getDriftWallImages(): DriftWallItem[] {
  const seen = new Set<string>();
  const items: DriftWallItem[] = [];

  const push = (image: string, title: string) => {
    if (seen.has(image) || items.length >= MAX_DRIFT_IMAGES) return;
    seen.add(image);
    items.push({ image, title });
  };

  for (const hero of getHeroImages()) {
    push(hero.src, hero.alt);
  }

  for (const project of getStaticProjects()) {
    push(project.coverImage, `${project.title} — ${project.category}`);
    for (const src of project.gallery) {
      push(src, `${project.title} interior detail`);
    }
  }

  return items;
}
