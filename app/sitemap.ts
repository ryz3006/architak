import type { MetadataRoute } from "next";

import { getStaticProjects } from "@/content/static";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://architak.in";
  const projects = getStaticProjects();

  return [
    { url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/studio`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/services`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.8 },
    ...projects.map((project) => ({
      url: `${siteUrl}/work/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
