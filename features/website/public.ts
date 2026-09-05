import "server-only";

import { getSecretSupabase } from "@/lib/supabase/server";
import { resolvePublishedProjects } from "@/features/content/resolver";
import type { WebsiteSectionConfig } from "@/features/website/admin";

const SETTINGS_KEY = "website.sections";

const DEFAULT_CONFIG: WebsiteSectionConfig = {
  selectedWorkSlugs: [],
  homepageVideoIds: [],
  studioDomeSlugs: [],
  featuredWorksEnabled: true,
};

function parseConfig(value: unknown): WebsiteSectionConfig | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Partial<WebsiteSectionConfig>;
  return {
    selectedWorkSlugs: Array.isArray(raw.selectedWorkSlugs)
      ? raw.selectedWorkSlugs.filter((s): s is string => typeof s === "string")
      : [],
    homepageVideoIds: Array.isArray(raw.homepageVideoIds)
      ? raw.homepageVideoIds.filter((s): s is string => typeof s === "string")
      : [],
    studioDomeSlugs: Array.isArray(raw.studioDomeSlugs)
      ? raw.studioDomeSlugs.filter((s): s is string => typeof s === "string")
      : [],
    featuredWorksEnabled: raw.featuredWorksEnabled !== false,
  };
}

/**
 * Public website placement config.
 * Uses the secret client on the server only — `site_settings` is not anon-readable.
 * Values are non-secret placement slugs/ids (not credentials).
 */
export async function getPublicWebsiteSectionConfig(): Promise<WebsiteSectionConfig> {
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    const parsed = parseConfig(data?.value);
    if (parsed) return parsed;

    const projects = await resolvePublishedProjects();
    return {
      ...DEFAULT_CONFIG,
      selectedWorkSlugs: projects.slice(0, 6).map((p) => p.slug),
      studioDomeSlugs: projects.map((p) => p.slug),
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
