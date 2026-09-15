import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import type { JournalStatus } from "@/lib/supabase/database.types";

export type AdminJournalListItem = {
  id: string;
  slug: string;
  title: string;
  status: JournalStatus;
  published_at: string | null;
  expires_at: string | null;
  trashed_at: string | null;
  updated_at: string;
};

export type AdminJournalDetail = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: { intro?: string; sections?: Array<{ heading?: string; body?: string }> } | null;
  cover_media_id: string | null;
  status: JournalStatus;
  published_at: string | null;
  expires_at: string | null;
  expiry_action: "hard_delete" | "archive";
  trashed_at: string | null;
  lang: string | null;
  dir: string | null;
  reading_time: number | null;
  featured: boolean;
  related_project_ids: string[];
};

export type AdminJournalSpaceUsage = {
  draftCount: number;
  publishedCount: number;
  archivedCount: number;
  trashedCount: number;
  estimatedBytes: number;
  trashPendingPurge: number;
};

/**
 * List all journal posts excluding hard-deleted ones.
 */
export async function listAdminJournalPosts(): Promise<AdminJournalListItem[]> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("journal_posts")
      .select("id, slug, title, status, published_at, expires_at, trashed_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error || !data) {
      console.error("Journal list failed", error?.code ?? "unknown");
      return [];
    }

    return data;
  } catch {
    return [];
  }
}

/**
 * Get one journal post by slug or id for admin editing.
 */
export async function getAdminJournalPost(slugOrId: string): Promise<AdminJournalDetail | null> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    
    // Try by slug first, then by id
    let query = supabase.from("journal_posts").select("*");
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId)) {
      query = query.eq("id", slugOrId);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    const { data: relatedProjects } = await supabase
      .from("journal_post_related_projects")
      .select("project_id, sort_order")
      .eq("journal_post_id", data.id)
      .order("sort_order", { ascending: true });

    return {
      id: data.id,
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body:
        data.body && typeof data.body === "object" && !Array.isArray(data.body)
          ? (data.body as AdminJournalDetail["body"])
          : null,
      cover_media_id: data.cover_media_id,
      status: data.status as JournalStatus,
      published_at: data.published_at,
      expires_at: data.expires_at,
      expiry_action: data.expiry_action,
      trashed_at: data.trashed_at,
      lang: data.lang,
      dir: data.dir,
      reading_time: data.reading_time,
      featured: data.featured,
      related_project_ids: (relatedProjects ?? []).map((row) => row.project_id),
    };
  } catch {
    return null;
  }
}

/**
 * Calculate space usage metrics for admin dashboard.
 */
export async function getJournalSpaceUsage(): Promise<AdminJournalSpaceUsage> {
  await requireAdminSession();

  const empty: AdminJournalSpaceUsage = {
    draftCount: 0,
    publishedCount: 0,
    archivedCount: 0,
    trashedCount: 0,
    estimatedBytes: 0,
    trashPendingPurge: 0,
  };

  try {
    const supabase = getSecretSupabase();

    const [
      { count: draftCount },
      { count: publishedCount },
      { count: archivedCount },
      { count: trashedCount },
      { count: totalCount },
    ] = await Promise.all([
      supabase.from("journal_posts").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("journal_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("journal_posts").select("id", { count: "exact", head: true }).eq("status", "archived"),
      supabase.from("journal_posts").select("id", { count: "exact", head: true }).eq("status", "trashed"),
      supabase.from("journal_posts").select("id", { count: "exact", head: true }),
    ]);

    // Calculate trash pending purge (trashed > 7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { count: trashPendingPurge } = await supabase
      .from("journal_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "trashed")
      .lt("trashed_at", sevenDaysAgo.toISOString());

    return {
      draftCount: draftCount ?? 0,
      publishedCount: publishedCount ?? 0,
      archivedCount: archivedCount ?? 0,
      trashedCount: trashedCount ?? 0,
      estimatedBytes: (totalCount ?? 0) * 1200, // ~1.2KB per post estimate
      trashPendingPurge: trashPendingPurge ?? 0,
    };
  } catch {
    return empty;
  }
}
