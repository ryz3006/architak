import "server-only";

import { getStaticProjects } from "@/content/static";
import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import { listProjectTestimonialsAdmin } from "@/features/projects/testimonials";

export type AdminProjectListItem = {
  slug: string;
  title: string;
  category: string;
  status: string;
  source: "cms" | "static";
};

export type AdminProjectDetail = {
  id: string | null;
  slug: string;
  title: string;
  summary: string | null;
  location: string | null;
  status: string;
  is_featured: boolean;
  cover_media_id: string | null;
  category_slug: string | null;
  gallery_media_ids: string[];
  body: { intro?: string; sections?: Array<{ heading?: string; body?: string }> } | null;
  testimonials: Array<{
    id?: string;
    quote: string;
    author_name: string;
    author_role: string | null;
    location: string | null;
    is_enabled: boolean;
  }>;
  source: "cms" | "static";
};

/**
 * Prefers Supabase when the migration is applied; falls back to static content
 * so the admin remains useful before the remote schema is pushed.
 */
export async function listAdminProjects(): Promise<AdminProjectListItem[]> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const [{ data: projects, error: projectsError }, { data: categories }] = await Promise.all([
      supabase
        .from("projects")
        .select("slug, title, status, category_id")
        .order("sort_order", { ascending: true }),
      supabase.from("project_categories").select("id, name"),
    ]);

    if (!projectsError && projects && projects.length > 0) {
      const categoryById = new Map((categories ?? []).map((category) => [category.id, category.name]));
      return projects.map((row) => ({
        slug: row.slug,
        title: row.title,
        category: (row.category_id && categoryById.get(row.category_id)) || "Uncategorised",
        status: row.status,
        source: "cms" as const,
      }));
    }
  } catch {
    // Fall through to static content.
  }

  return getStaticProjects().map((project) => ({
    slug: project.slug,
    title: project.title,
    category: project.category,
    status: "published",
    source: "static" as const,
  }));
}

export async function getAdminProject(slug: string): Promise<AdminProjectDetail | null> {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (!error && data) {
      const [{ data: category }, { data: gallery }, testimonials] = await Promise.all([
        data.category_id
          ? supabase
              .from("project_categories")
              .select("slug")
              .eq("id", data.category_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("project_media")
          .select("media_asset_id, sort_order")
          .eq("project_id", data.id)
          .eq("role", "gallery")
          .order("sort_order", { ascending: true }),
        listProjectTestimonialsAdmin(data.id),
      ]);

      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        summary: data.summary,
        location: data.location,
        status: data.status,
        is_featured: data.is_featured,
        cover_media_id: data.cover_media_id,
        category_slug: category?.slug ?? null,
        gallery_media_ids: (gallery ?? []).map((row) => row.media_asset_id),
        body:
          data.body && typeof data.body === "object" && !Array.isArray(data.body)
            ? (data.body as AdminProjectDetail["body"])
            : null,
        testimonials: testimonials.map((t) => ({
          id: t.id,
          quote: t.quote,
          author_name: t.author_name,
          author_role: t.author_role,
          location: t.location,
          is_enabled: t.is_enabled,
        })),
        source: "cms" as const,
      };
    }
  } catch {
    // Fall through.
  }

  const fallback = getStaticProjects().find((project) => project.slug === slug);
  if (!fallback) return null;

  return {
    id: null,
    slug: fallback.slug,
    title: fallback.title,
    summary: fallback.summary,
    location: fallback.location,
    status: "published",
    is_featured: true,
    cover_media_id: null,
    category_slug: fallback.category.toLowerCase().replace(/\s+/g, "-"),
    gallery_media_ids: [],
    body: null,
    testimonials: [],
    source: "static" as const,
  };
}
