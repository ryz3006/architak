import "server-only";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/features/auth/session";
import { createPublishableClient } from "@/lib/supabase/client";
import { getSecretSupabase } from "@/lib/supabase/server";

export type JsonObject = Record<string, unknown>;

export const CONTENT_PAGE_SLUGS = ["home", "studio", "services", "contact"] as const;
export type ContentPageSlug = (typeof CONTENT_PAGE_SLUGS)[number];

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge an override object over a base. Plain objects merge recursively;
 * everything else (including arrays) is replaced when present in the override.
 * This lets the CMS store partial overrides on top of the static defaults, so
 * un-edited fields always keep their bundled values.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  if (!isPlainObject(base)) return override as T;

  const result: JsonObject = { ...(base as JsonObject) };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/* ------------------------------------------------------------------ *
 * Page content (pages.content JSONB) — anon-readable when published.  *
 * ------------------------------------------------------------------ */

/** Public read of a published page's content override (anon client, RLS). */
export async function getPublicPageOverride(slug: ContentPageSlug): Promise<JsonObject> {
  try {
    const supabase = createPublishableClient();
    const { data } = await supabase
      .from("pages")
      .select("content")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    return isPlainObject(data?.content) ? (data!.content as JsonObject) : {};
  } catch {
    return {};
  }
}

/** Admin read of a page's content override (secret client, any status). */
export async function getAdminPageOverride(slug: ContentPageSlug): Promise<JsonObject> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("pages")
      .select("content")
      .eq("slug", slug)
      .maybeSingle();
    return isPlainObject(data?.content) ? (data!.content as JsonObject) : {};
  } catch {
    return {};
  }
}

const PAGE_REVALIDATE: Record<ContentPageSlug, string> = {
  home: "/",
  studio: "/studio",
  services: "/services",
  contact: "/contact",
};

/** Persist a page content override (admin only) and revalidate the route. */
export async function savePageOverride(
  slug: ContentPageSlug,
  content: JsonObject,
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase
      .from("pages")
      .update({ content: content as never })
      .eq("slug", slug);
    if (error) return { ok: false, message: "Could not save page content." };

    await supabase.from("audit_events").insert({
      action: "page.content_updated",
      entity_type: "pages",
      entity_id: slug,
      after_data: content as never,
    });

    revalidatePath(PAGE_REVALIDATE[slug]);
    revalidatePath(`/admin/content/pages/${slug}`);
    return { ok: true, message: "Page content published." };
  } catch {
    return { ok: false, message: "Could not save. Confirm the database is available." };
  }
}

/* ------------------------------------------------------------------ *
 * Global content lists (site_settings) — server-only reads.          *
 * site_settings is deny-all for anon, so both public and admin reads  *
 * use the secret client on the server (same pattern as website.sections). *
 * ------------------------------------------------------------------ */

export async function getSettingValue(key: string): Promise<unknown> {
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value ?? null;
  } catch {
    return null;
  }
}

export async function getAdminSettingValue(key: string): Promise<unknown> {
  await requireAdminSession();
  return getSettingValue(key);
}

export async function saveSettingValue(
  key: string,
  value: unknown,
  description: string,
  revalidate: string[] = [],
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("site_settings").upsert({
      key,
      value: value as never,
      description,
    });
    if (error) return { ok: false, message: "Could not save content." };

    await supabase.from("audit_events").insert({
      action: "content.updated",
      entity_type: "site_settings",
      entity_id: key,
      after_data: value as never,
    });

    for (const path of revalidate) revalidatePath(path);
    return { ok: true, message: "Content published." };
  } catch {
    return { ok: false, message: "Could not save. Confirm the database is available." };
  }
}
