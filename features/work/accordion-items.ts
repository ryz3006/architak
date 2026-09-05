import "server-only";

import { getStaticProjects } from "@/content/static";
import { getStorageService } from "@/lib/storage/r2";
import { createPublishableClient } from "@/lib/supabase/client";
import { getPublicWebsiteSectionConfig } from "@/features/website/public";

export type AccordionGalleryItem = {
  image: string;
  label: string;
  link: string;
  alt: string;
};

function resolveStorageKeyUrl(storageKey: string): string | null {
  const legacyMatch = storageKey.match(/^public\/legacy\/(.+)$/);
  if (legacyMatch) {
    return `/media/${legacyMatch[1]}`;
  }

  const storage = getStorageService();
  return storage.getPublicUrl(storageKey);
}

function resolveCoverUrl(coverImage: string): string {
  if (coverImage.startsWith("http://") || coverImage.startsWith("https://")) {
    return coverImage;
  }
  return coverImage.startsWith("/") ? coverImage : `/${coverImage}`;
}

function formatLabel(title: string, category: string): string {
  return `${title} · ${category}`;
}

function formatAlt(title: string, category: string, location: string): string {
  return `${title} — ${category} interior in ${location}`;
}

function staticFeaturedItems(slugs?: string[]): AccordionGalleryItem[] {
  const projects = getStaticProjects().filter((project) => Boolean(project.coverImage));
  const ordered =
    slugs && slugs.length > 0
      ? slugs
          .map((slug) => projects.find((p) => p.slug === slug))
          .filter((p): p is NonNullable<typeof p> => Boolean(p))
      : projects;

  return ordered.map((project) => ({
    image: resolveCoverUrl(project.coverImage),
    label: formatLabel(project.title, project.category),
    link: `/work/${project.slug}`,
    alt: formatAlt(project.title, project.category, project.location),
  }));
}

type CmsFeaturedRow = {
  slug: string;
  title: string;
  location: string | null;
  sort_order: number;
  project_categories: { name: string } | null;
  media_assets: {
    storage_key: string;
    alt_text: string | null;
    visibility: "public" | "private";
  } | null;
};

function rowsToItems(data: CmsFeaturedRow[]): AccordionGalleryItem[] {
  return data
    .map((row) => {
      const asset = row.media_assets;
      if (!asset?.storage_key) return null;

      const image =
        asset.visibility === "public" ? resolveStorageKeyUrl(asset.storage_key) : null;
      if (!image) return null;

      const category = row.project_categories?.name ?? "Interior";
      const location = row.location ?? "Kochi";

      return {
        image,
        label: formatLabel(row.title, category),
        link: `/work/${row.slug}`,
        alt: asset.alt_text ?? formatAlt(row.title, category, location),
      } satisfies AccordionGalleryItem;
    })
    .filter((item): item is AccordionGalleryItem => item !== null);
}

/** Keep CMS ordering but swap in bundled covers when CDN keys are missing locally. */
function mergeStaticCoverFallback(items: AccordionGalleryItem[]): AccordionGalleryItem[] {
  const staticBySlug = new Map(
    staticFeaturedItems().map((item) => [item.link.replace(/^\/work\//, ""), item] as const),
  );

  return items.map((item) => {
    const slug = item.link.replace(/^\/work\//, "");
    const fallback = staticBySlug.get(slug);
    if (!fallback) return item;
    return {
      ...item,
      image: fallback.image,
      alt: item.alt || fallback.alt,
    };
  });
}

/**
 * Featured work panels for the homepage accordion.
 * Prefers Website Management selectedWorkSlugs, then featured CMS projects, then static.
 */
export async function getFeaturedAccordionItems(): Promise<AccordionGalleryItem[]> {
  const config = await getPublicWebsiteSectionConfig();
  if (!config.featuredWorksEnabled) return [];

  try {
    const supabase = createPublishableClient();
    const select = `
        slug,
        title,
        location,
        sort_order,
        project_categories ( name ),
        media_assets!cover_media_id ( storage_key, alt_text, visibility )
      `;

    let data: CmsFeaturedRow[] | null = null;

    if (config.selectedWorkSlugs.length > 0) {
      const { data: rows, error } = await supabase
        .from("projects")
        .select(select)
        .eq("status", "published")
        .in("slug", config.selectedWorkSlugs);

      if (!error && rows?.length) {
        const bySlug = new Map((rows as CmsFeaturedRow[]).map((r) => [r.slug, r]));
        data = config.selectedWorkSlugs
          .map((slug) => bySlug.get(slug))
          .filter((r): r is CmsFeaturedRow => Boolean(r));
      }
    }

    if (!data?.length) {
      const { data: rows, error } = await supabase
        .from("projects")
        .select(select)
        .eq("status", "published")
        .eq("is_featured", true)
        .order("sort_order", { ascending: true });

      if (!error && rows?.length) {
        data = rows as CmsFeaturedRow[];
      }
    }

    if (!data?.length) {
      return staticFeaturedItems(config.selectedWorkSlugs);
    }

    const items = rowsToItems(data);
    if (items.length > 0) {
      return mergeStaticCoverFallback(items);
    }

    return staticFeaturedItems(config.selectedWorkSlugs);
  } catch {
    return staticFeaturedItems(config.selectedWorkSlugs);
  }
}
