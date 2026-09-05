import "server-only";

import { getStaticProjectBySlug, getStaticProjects, type StaticProject } from "@/content/static";
import { getStorageService } from "@/lib/storage/r2";
import { createPublishableClient } from "@/lib/supabase/client";

export type ResolvedProject = {
  id: string | null;
  slug: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  coverImage: string;
  gallery: string[];
  source: "cms" | "static";
  status?: string;
};

function mediaPublicUrl(storageKey: string | null | undefined): string | null {
  if (!storageKey?.startsWith("public/")) return null;
  try {
    return getStorageService().getPublicUrl(storageKey);
  } catch {
    return null;
  }
}

function staticToResolved(project: StaticProject): ResolvedProject {
  return {
    id: null,
    slug: project.slug,
    title: project.title,
    category: project.category,
    location: project.location,
    summary: project.summary,
    coverImage: project.coverImage,
    gallery: project.gallery,
    source: "static",
  };
}

/**
 * Central public content resolution for projects.
 * Prefer published CMS rows; fall back to static site.json.
 */
export async function resolvePublishedProjects(): Promise<ResolvedProject[]> {
  try {
    const supabase = createPublishableClient();
    const { data: projects, error } = await supabase
      .from("projects")
      .select("id, slug, title, summary, location, status, cover_media_id, category_id, sort_order")
      .eq("status", "published")
      .order("sort_order", { ascending: true });

    if (error || !projects?.length) {
      return getStaticProjects().map(staticToResolved);
    }

    const [{ data: categories }, { data: mediaAssets }, { data: projectMedia }] = await Promise.all([
      supabase.from("project_categories").select("id, name"),
      supabase.from("media_assets").select("id, storage_key").eq("visibility", "public"),
      supabase.from("project_media").select("project_id, media_asset_id, role, sort_order").eq("role", "gallery"),
    ]);

    const categoryById = new Map((categories ?? []).map((c) => [c.id, c.name]));
    const mediaById = new Map((mediaAssets ?? []).map((m) => [m.id, m.storage_key]));

    return projects.map((row) => {
      const staticFallback = getStaticProjectBySlug(row.slug);
      const coverKey = row.cover_media_id ? mediaById.get(row.cover_media_id) : undefined;
      const galleryKeys = (projectMedia ?? [])
        .filter((pm) => pm.project_id === row.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((pm) => mediaById.get(pm.media_asset_id))
        .filter((key): key is string => Boolean(key));

      const galleryUrls = galleryKeys
        .map((key) => mediaPublicUrl(key))
        .filter((url): url is string => Boolean(url));

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        category:
          (row.category_id && categoryById.get(row.category_id)) ||
          staticFallback?.category ||
          "Interior",
        location: row.location || staticFallback?.location || "Kochi",
        summary: row.summary || staticFallback?.summary || "",
        coverImage:
          mediaPublicUrl(coverKey) || staticFallback?.coverImage || "/brand/logo-mark.png",
        gallery: galleryUrls.length > 0 ? galleryUrls : staticFallback?.gallery || [],
        source: "cms" as const,
        status: row.status,
      };
    });
  } catch {
    return getStaticProjects().map(staticToResolved);
  }
}

export async function resolvePublishedProject(slug: string): Promise<ResolvedProject | null> {
  const all = await resolvePublishedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

/** Fill to a minimum count by cycling published items (Explore Spaces). */
export function fillToMinimum<T>(items: T[], minimum: number): T[] {
  if (items.length === 0) return items;
  if (items.length >= minimum) return items;
  const result: T[] = [...items];
  let i = 0;
  while (result.length < minimum) {
    result.push(items[i % items.length]!);
    i += 1;
  }
  return result;
}
