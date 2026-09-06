import "server-only";

import { z } from "zod";

import { isBotUserAgent, parseUserAgent, readGeoFromHeaders, referrerHost } from "@/features/analytics/ua";
import { getServerEnv } from "@/lib/env";
import { getSecretSupabase } from "@/lib/supabase/server";

export const TRAFFIC_RETENTION_DAYS = 30;
/** Soft cap on relation size (table + indexes). Oldest rows are pruned first. */
export const TRAFFIC_MAX_BYTES = 25 * 1024 * 1024;

const collectSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine((value) => value.startsWith("/") && !value.startsWith("//"), "Invalid path"),
  visitorId: z.string().trim().min(8).max(64).optional(),
  referrer: z.string().trim().max(500).optional().or(z.literal("")),
});

function shouldSkipPath(path: string): boolean {
  if (path.startsWith("/admin")) return true;
  if (path.startsWith("/api")) return true;
  if (path.startsWith("/_next")) return true;
  if (path.startsWith("/dev")) return true;
  if (
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path === "/manifest.webmanifest" ||
    path === "/llms.txt" ||
    path === "/llms-full.txt" ||
    path === "/favicon.ico" ||
    path === "/favicon.svg" ||
    path === "/favicon-96x96.png" ||
    path === "/apple-touch-icon.png" ||
    path === "/apple-icon.png" ||
    path === "/icon.png" ||
    path === "/icon-192.png" ||
    path === "/icon-512.png" ||
    path === "/opengraph-image"
  ) {
    return true;
  }
  return false;
}

export type CollectResult = { ok: true } | { ok: false; message: string; status: number };

/**
 * Record one page view. Called from the public beacon API after rate limiting.
 * Does not store raw IP addresses.
 */
export async function collectPageView(
  input: unknown,
  headers: Headers,
): Promise<CollectResult> {
  const parsed = collectSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid payload.", status: 400 };
  }

  const path = parsed.data.path.split("?")[0]!.slice(0, 500);
  if (shouldSkipPath(path)) {
    return { ok: true };
  }

  const ua = headers.get("user-agent");
  if (isBotUserAgent(ua)) {
    return { ok: true };
  }

  const { browser, device } = parseUserAgent(ua);
  const geo = readGeoFromHeaders(headers);
  let siteHost = "localhost";
  try {
    siteHost = new URL(getServerEnv().NEXT_PUBLIC_SITE_URL).host;
  } catch {
    // keep localhost
  }

  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("page_views").insert({
      path,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      browser,
      device,
      referrer_host: referrerHost(parsed.data.referrer || null, siteHost),
      visitor_id: parsed.data.visitorId?.slice(0, 64) ?? null,
    });

    if (error) {
      // Table may not be migrated yet — fail soft so the public site stays quiet.
      console.error(JSON.stringify({ event: "page_view_insert_failed", code: error.code }));
      return { ok: false, message: "Could not record visit.", status: 503 };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Analytics unavailable.", status: 503 };
  }
}

export type RetentionResult = {
  ok: boolean;
  deletedByAge: number;
  deletedBySize: number;
  bytesBefore: number;
  bytesAfter: number;
};

/**
 * Enforce 30-day and ~25 MB caps. Deletes oldest rows first when over budget.
 */
export async function enforceTrafficRetention(): Promise<RetentionResult> {
  const empty: RetentionResult = {
    ok: false,
    deletedByAge: 0,
    deletedBySize: 0,
    bytesBefore: 0,
    bytesAfter: 0,
  };

  try {
    const supabase = getSecretSupabase();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - TRAFFIC_RETENTION_DAYS);

    const { data: aged, error: ageError } = await supabase
      .from("page_views")
      .delete()
      .lt("occurred_at", cutoff.toISOString())
      .select("id");

    if (ageError) {
      console.error(JSON.stringify({ event: "traffic_retention_age_failed", code: ageError.code }));
      return empty;
    }

    const deletedByAge = aged?.length ?? 0;
    const bytesBefore = await estimatePageViewsBytes();

    let deletedBySize = 0;
    let bytes = bytesBefore;
    // Batch-delete oldest rows until under the soft cap.
    while (bytes > TRAFFIC_MAX_BYTES) {
      const { data: oldest } = await supabase
        .from("page_views")
        .select("id")
        .order("occurred_at", { ascending: true })
        .limit(500);

      if (!oldest?.length) break;

      const ids = oldest.map((row) => row.id as number);
      const { error } = await supabase.from("page_views").delete().in("id", ids);
      if (error) break;
      deletedBySize += ids.length;
      bytes = await estimatePageViewsBytes();
      if (ids.length < 500) break;
    }

    return {
      ok: true,
      deletedByAge,
      deletedBySize,
      bytesBefore,
      bytesAfter: await estimatePageViewsBytes(),
    };
  } catch {
    return empty;
  }
}

/** Approximate on-disk size for page_views (table + indexes). */
export async function estimatePageViewsBytes(): Promise<number> {
  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase.rpc("page_views_relation_bytes");
    if (!error && typeof data === "number" && Number.isFinite(data)) {
      return data;
    }
  } catch {
    // fall through
  }

  try {
    const supabase = getSecretSupabase();
    const { count } = await supabase
      .from("page_views")
      .select("id", { count: "exact", head: true });
    // ~220 bytes/row average including indexes (conservative).
    return (count ?? 0) * 220;
  } catch {
    return 0;
  }
}
