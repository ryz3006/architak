import "server-only";

import { z } from "zod";

import { isBotUserAgent, parseUserAgent, readGeoFromHeaders, referrerHost } from "@/features/analytics/ua";
import { getServerEnv } from "@/lib/env";
import { getSecretSupabase } from "@/lib/supabase/server";

export const ENGAGEMENT_RETENTION_DAYS = 90;

const shareEventSchema = z.object({
  subjectType: z.enum(["journal_post", "project", "page"]),
  subjectSlug: z.string().trim().min(1).max(200),
  method: z.enum(["native", "copy"]).optional(),
});

export type ShareEventResult = { ok: true } | { ok: false; message: string; status: number };

/**
 * Record one share event. Called from the public share API after rate limiting.
 */
export async function recordShareEvent(
  input: unknown,
  headers: Headers,
): Promise<ShareEventResult> {
  const parsed = shareEventSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Invalid payload.", status: 400 };
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
    const { error } = await supabase.from("engagement_events").insert({
      event_type: "share",
      subject_type: parsed.data.subjectType,
      subject_slug: parsed.data.subjectSlug,
      method: parsed.data.method ?? null,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      browser,
      device,
      referrer_host: referrerHost(headers.get("referer"), siteHost),
      visitor_id: null,
    });

    if (error) {
      console.error(JSON.stringify({ event: "share_event_insert_failed", code: error.code }));
      return { ok: false, message: "Could not record share.", status: 503 };
    }
    return { ok: true };
  } catch {
    return { ok: false, message: "Analytics unavailable.", status: 503 };
  }
}

export type EngagementRetentionResult = {
  ok: boolean;
  deletedByAge: number;
};

/**
 * Enforce 90-day retention cap. Deletes oldest rows first.
 */
export async function enforceEngagementRetention(): Promise<EngagementRetentionResult> {
  const empty: EngagementRetentionResult = {
    ok: false,
    deletedByAge: 0,
  };

  try {
    const supabase = getSecretSupabase();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ENGAGEMENT_RETENTION_DAYS);

    const { data: aged, error: ageError } = await supabase
      .from("engagement_events")
      .delete()
      .lt("occurred_at", cutoff.toISOString())
      .select("id");

    if (ageError) {
      console.error(JSON.stringify({ event: "engagement_retention_age_failed", code: ageError.code }));
      return empty;
    }

    return {
      ok: true,
      deletedByAge: aged?.length ?? 0,
    };
  } catch {
    return empty;
  }
}

export type ShareAnalyticsForAdmin = {
  total30Days: number;
  byMethod: Array<{ method: string; count: number }>;
  byPost: Array<{ slug: string; title: string; count: number }>;
};

/**
 * Get share analytics for admin dashboard (last 30 days).
 */
export async function getShareAnalyticsForAdmin(): Promise<ShareAnalyticsForAdmin> {
  const empty: ShareAnalyticsForAdmin = {
    total30Days: 0,
    byMethod: [],
    byPost: [],
  };

  try {
    const supabase = getSecretSupabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events } = await supabase
      .from("engagement_events")
      .select("event_type, subject_type, subject_slug, method")
      .eq("event_type", "share")
      .gte("occurred_at", thirtyDaysAgo.toISOString());

    if (!events) return empty;

    const total30Days = events.length;

    const methodCounts = new Map<string, number>();
    events.forEach((e) => {
      const method = e.method || "unknown";
      methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
    });

    const postCounts = new Map<string, number>();
    events
      .filter((e) => e.subject_type === "journal_post")
      .forEach((e) => {
        postCounts.set(e.subject_slug, (postCounts.get(e.subject_slug) || 0) + 1);
      });

    const byMethod = Array.from(methodCounts.entries())
      .map(([method, count]) => ({ method, count }))
      .sort((a, b) => b.count - a.count);

    // Fetch post titles
    const postSlugs = Array.from(postCounts.keys());
    const { data: posts } = postSlugs.length > 0
      ? await supabase
          .from("journal_posts")
          .select("slug, title")
          .in("slug", postSlugs)
      : { data: [] };

    const postTitleBySlug = new Map((posts ?? []).map((p) => [p.slug, p.title]));

    const byPost = Array.from(postCounts.entries())
      .map(([slug, count]) => ({
        slug,
        title: postTitleBySlug.get(slug) || slug,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      total30Days,
      byMethod,
      byPost,
    };
  } catch {
    return empty;
  }
}
