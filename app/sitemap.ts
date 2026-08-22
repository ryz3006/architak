import type { MetadataRoute } from "next";

import { absoluteUrl, getPublishedProjects, getStaticRoutes } from "@/features/discovery";

/** Stable sitemap dates until CMS publish timestamps exist. */
const CONTENT_LAST_MODIFIED = new Date("2026-08-22T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...getStaticRoutes().map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...getPublishedProjects().map((project) => ({
      url: absoluteUrl(project.path),
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
