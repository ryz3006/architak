import type { MetadataRoute } from "next";

import { absoluteUrl, getPublishedProjects, getStaticRoutes } from "@/features/discovery";
import { resolvePublishedJournalPosts } from "@/features/journal/resolver";

/** Stable sitemap dates until CMS publish timestamps exist. */
const CONTENT_LAST_MODIFIED = new Date("2026-08-22T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journalPosts = await resolvePublishedJournalPosts();

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
    {
      url: absoluteUrl("/journal"),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    },
    ...journalPosts.map((post) => ({
      url: absoluteUrl(`/journal/${post.slug}`),
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
