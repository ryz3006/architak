import "server-only";

import { createPublishableClient } from "@/lib/supabase/client";
import { resolvePublicMediaUrl } from "@/features/media/public-url";

export type JournalPostBodySection = { heading?: string; body?: string };
export type JournalPostBody = { intro?: string; sections?: JournalPostBodySection[] } | null;

export type ResolvedJournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: JournalPostBody;
  coverImage: string | null;
  status: string;
  published_at: string | null;
  expires_at: string | null;
  lang: string | null;
  dir: string | null;
  featured: boolean;
  relatedProjects: Array<{ slug: string; title: string }>;
};

function parseJournalBody(value: unknown): JournalPostBody {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as { intro?: unknown; sections?: unknown };
  const intro = typeof raw.intro === "string" ? raw.intro : undefined;
  const sections = Array.isArray(raw.sections)
    ? raw.sections
        .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === "object")
        .map((s) => ({
          heading: typeof s.heading === "string" ? s.heading : undefined,
          body: typeof s.body === "string" ? s.body : undefined,
        }))
        .filter((s) => s.heading || s.body)
    : undefined;
  if (!intro && (!sections || sections.length === 0)) return null;
  return { intro, sections };
}

function mediaPublicUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey) return null;
  return resolvePublicMediaUrl(storageKey);
}

/**
 * Resolve all published, non-expired, non-trashed journal posts.
 */
export async function resolvePublishedJournalPosts(): Promise<ResolvedJournalPost[]> {
  try {
    const supabase = createPublishableClient();
    const now = new Date().toISOString();

    const { data: posts, error } = await supabase
      .from("journal_posts")
      .select("*")
      .eq("status", "published")
      .lte("published_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .is("trashed_at", null)
      .order("published_at", { ascending: false });

    if (error || !posts?.length) {
      return [];
    }

    const postIds = posts.map((p) => p.id);
    const coverMediaIds = posts.map((p) => p.cover_media_id).filter((id): id is string => Boolean(id));

    const [{ data: mediaAssets }, { data: relatedProjects }] = await Promise.all([
      coverMediaIds.length > 0
        ? supabase.from("media_assets").select("id, storage_key").in("id", coverMediaIds).eq("visibility", "public")
        : Promise.resolve({ data: [] }),
      supabase
        .from("journal_post_related_projects")
        .select("journal_post_id, project_id")
        .in("journal_post_id", postIds),
    ]);

    const mediaById = new Map((mediaAssets ?? []).map((m) => [m.id, m.storage_key]));

    // Fetch related projects
    const relatedProjectIds = (relatedProjects ?? []).map((rp) => rp.project_id);
    const { data: projects } = relatedProjectIds.length > 0
      ? await supabase
          .from("projects")
          .select("id, slug, title")
          .in("id", relatedProjectIds)
          .eq("status", "published")
      : { data: [] };

    const projectById = new Map((projects ?? []).map((p) => [p.id, p]));

    return posts.map((row) => {
      const coverKey = row.cover_media_id ? mediaById.get(row.cover_media_id) : undefined;
      const related = (relatedProjects ?? [])
        .filter((rp) => rp.journal_post_id === row.id)
        .map((rp) => projectById.get(rp.project_id))
        .filter((p): p is NonNullable<typeof p> => Boolean(p))
        .map((p) => ({ slug: p.slug, title: p.title }));

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        excerpt: row.excerpt,
        body: parseJournalBody(row.body),
        coverImage: mediaPublicUrl(coverKey),
        status: row.status,
        published_at: row.published_at,
        expires_at: row.expires_at,
        lang: row.lang,
        dir: row.dir,
        featured: row.featured,
        relatedProjects: related,
      };
    });
  } catch {
    return [];
  }
}

export async function resolvePublishedJournalPost(slug: string): Promise<ResolvedJournalPost | null> {
  const all = await resolvePublishedJournalPosts();
  return all.find((p) => p.slug === slug) ?? null;
}
