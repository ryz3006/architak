import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { getSecretSupabase } from "@/lib/supabase/server";
import { enforceEngagementRetention } from "@/features/analytics/share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_SECRET_LENGTH = 32;

function getExpectedSecret(): string | null {
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  if (expected.length < MIN_SECRET_LENGTH) return null;
  return expected;
}

function authorized(request: Request, expected: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!bearer) return false;
  const a = Buffer.from(bearer);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

type ExpiryResult = {
  ok: boolean;
  expiredCount: number;
  trashedCount: number;
  deletedCount: number;
  engagementPurged: number;
};

async function applyJournalExpiry(): Promise<ExpiryResult> {
  const empty: ExpiryResult = {
    ok: false,
    expiredCount: 0,
    trashedCount: 0,
    deletedCount: 0,
    engagementPurged: 0,
  };

  try {
    const supabase = getSecretSupabase();
    const now = new Date().toISOString();

    // Find expired posts
    const { data: expiredPosts } = await supabase
      .from("journal_posts")
      .select("id, slug, expiry_action")
      .eq("status", "published")
      .lte("expires_at", now)
      .not("expires_at", "is", null);

    if (!expiredPosts || expiredPosts.length === 0) {
      // Still purge old trash and engagement events
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [{ data: oldTrash }, engagementResult] = await Promise.all([
        supabase
          .from("journal_posts")
          .delete()
          .eq("status", "trashed")
          .lt("trashed_at", sevenDaysAgo.toISOString())
          .select("id"),
        enforceEngagementRetention(),
      ]);

      return {
        ok: true,
        expiredCount: 0,
        trashedCount: 0,
        deletedCount: oldTrash?.length ?? 0,
        engagementPurged: engagementResult.deletedByAge,
      };
    }

    let trashedCount = 0;
    let archivedCount = 0;

    for (const post of expiredPosts) {
      if (post.expiry_action === "hard_delete") {
        await supabase
          .from("journal_posts")
          .update({ status: "trashed", trashed_at: now })
          .eq("id", post.id);
        trashedCount += 1;
      } else {
        await supabase
          .from("journal_posts")
          .update({ status: "archived" })
          .eq("id", post.id);
        archivedCount += 1;
      }
    }

    // Delete trash older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [{ data: oldTrash }, engagementResult] = await Promise.all([
      supabase
        .from("journal_posts")
        .delete()
        .eq("status", "trashed")
        .lt("trashed_at", sevenDaysAgo.toISOString())
        .select("id"),
      enforceEngagementRetention(),
    ]);

    // Clean up related projects for deleted posts
    if (oldTrash && oldTrash.length > 0) {
      await supabase
        .from("journal_post_related_projects")
        .delete()
        .in("journal_post_id", oldTrash.map((p) => p.id));
    }

    return {
      ok: true,
      expiredCount: expiredPosts.length,
      trashedCount,
      deletedCount: oldTrash?.length ?? 0,
      engagementPurged: engagementResult.deletedByAge,
    };
  } catch (err) {
    console.error("Journal expiry failed", err);
    return empty;
  }
}

/**
 * Hourly cron: apply journal expiry actions and purge old trash.
 */
export async function GET(request: Request) {
  const ip = getClientIpFromRequest(request);
  const expected = getExpectedSecret();
  if (!expected) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );
  }

  if (!authorized(request, expected)) {
    const limit = checkRateLimit(`cron-journal-auth-fail:${ip}`, 20, 60_000);
    if (!limit.ok) {
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, error: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
          },
        ),
      );
    }
    return applySecurityHeaders(
      NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );
  }

  const result = await applyJournalExpiry();
  console.info(JSON.stringify({ event: "journal_expiry", ...result }));
  return applySecurityHeaders(NextResponse.json(result));
}

export function POST() {
  return applySecurityHeaders(
    NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 }),
  );
}
