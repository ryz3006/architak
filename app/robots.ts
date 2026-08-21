import type { MetadataRoute } from "next";

import { getCrawlerPolicy, getDisallowedPaths, getSiteUrl } from "@/features/discovery";

/**
 * Env-driven crawler policy.
 *
 * Named agents in DISCOVERY_AI_CRAWLERS_ALLOW get an explicit allow rule so
 * search and AI-search crawlers are welcome on public routes; agents in
 * DISCOVERY_AI_CRAWLERS_DENY are blocked outright. The admin area, write APIs,
 * and internal routes are denied for every agent regardless of configuration.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const disallow = getDisallowedPaths();
  const { allow, deny } = getCrawlerPolicy();

  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    ...allow.map((userAgent) => ({
      userAgent,
      allow: "/",
      disallow,
    })),
    ...deny.map((userAgent) => ({
      userAgent,
      disallow: "/",
    })),
  ];

  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
