import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import { resolvePublishedProjects } from "@/features/content/resolver";
import { revalidatePath } from "next/cache";

export type WebsiteSectionConfig = {
  selectedWorkSlugs: string[];
  homepageVideoIds: string[];
  studioDomeSlugs: string[];
  featuredWorksEnabled: boolean;
};

const DEFAULT_CONFIG: WebsiteSectionConfig = {
  selectedWorkSlugs: [],
  homepageVideoIds: [],
  studioDomeSlugs: [],
  featuredWorksEnabled: true,
};

const SETTINGS_KEY = "website.sections";

export async function getWebsiteSectionConfig(): Promise<WebsiteSectionConfig> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (!data?.value || typeof data.value !== "object" || Array.isArray(data.value)) {
      const projects = await resolvePublishedProjects();
      return {
        ...DEFAULT_CONFIG,
        selectedWorkSlugs: projects.slice(0, 6).map((p) => p.slug),
        studioDomeSlugs: projects.map((p) => p.slug),
      };
    }

    const value = data.value as Partial<WebsiteSectionConfig>;
    return {
      selectedWorkSlugs: Array.isArray(value.selectedWorkSlugs) ? value.selectedWorkSlugs : [],
      homepageVideoIds: Array.isArray(value.homepageVideoIds) ? value.homepageVideoIds : [],
      studioDomeSlugs: Array.isArray(value.studioDomeSlugs) ? value.studioDomeSlugs : [],
      featuredWorksEnabled: value.featuredWorksEnabled !== false,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveWebsiteSectionConfig(
  config: WebsiteSectionConfig,
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("site_settings").upsert({
      key: SETTINGS_KEY,
      value: config,
      description: "Public website section placement and ordering",
    });
    if (error) return { ok: false, message: "Could not save website configuration." };

    await supabase.from("audit_events").insert({
      action: "website.sections_updated",
      entity_type: "site_settings",
      after_data: {
        selectedWorkSlugs: config.selectedWorkSlugs,
        homepageVideoIds: config.homepageVideoIds,
        studioDomeSlugs: config.studioDomeSlugs,
        featuredWorksEnabled: config.featuredWorksEnabled,
      },
    });

    revalidatePath("/");
    revalidatePath("/studio");
    revalidatePath("/admin/website-management");
    return { ok: true, message: "Website configuration published." };
  } catch {
    return { ok: false, message: "Could not save. Confirm the database is available." };
  }
}
