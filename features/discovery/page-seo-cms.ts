/**
 * Async CMS-aware page SEO with hardcoded PAGE_SEO fallback.
 */
import { cache } from "react";

import { createPublishableClient } from "@/lib/supabase/client";
import { getPageSeo, PAGE_SEO, type PageSeoEntry } from "@/features/discovery/page-seo";

const SLUG_BY_PATH: Record<string, string> = {
  "/": "home",
  "/studio": "studio",
  "/services": "services",
  "/contact": "contact",
};

export const getPageSeoFromCms = cache(async (path: string): Promise<PageSeoEntry> => {
  const fallback = getPageSeo(path) ?? PAGE_SEO[0]!;

  try {
    const slug = SLUG_BY_PATH[path];
    if (!slug) return fallback;

    const supabase = createPublishableClient();
    const { data: page } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!page) return fallback;

    const { data: seo } = await supabase
      .from("seo_metadata")
      .select("title, description, canonical_url, robots")
      .eq("subject_type", "page")
      .eq("subject_id", page.id)
      .maybeSingle();

    if (seo?.title && seo?.description) {
      return {
        path,
        title: seo.title,
        description: seo.description,
        changeFrequency: fallback.changeFrequency,
        priority: fallback.priority,
      };
    }
  } catch {
    // fall through
  }

  return fallback;
});
