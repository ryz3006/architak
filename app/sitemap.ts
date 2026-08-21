import type { MetadataRoute } from "next";

import { absoluteUrl, getPublishedProjects, getStaticRoutes } from "@/features/discovery";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...getStaticRoutes().map((route) => ({
      url: absoluteUrl(route.path),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...getPublishedProjects().map((project) => ({
      url: absoluteUrl(project.path),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
