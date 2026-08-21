import "server-only";

import { getStaticProjects } from "@/content/static";
import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";

export type AdminProjectListItem = {
  slug: string;
  title: string;
  category: string;
  status: string;
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

export async function getAdminProject(slug: string) {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (!error && data) return { ...data, source: "cms" as const };
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
    status: "published" as const,
    is_featured: true,
    source: "static" as const,
  };
}
