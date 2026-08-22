import "server-only";

import { getStaticProjects } from "@/content/static";
import { getStorageService } from "@/lib/storage/r2";
import { createPublishableClient } from "@/lib/supabase/client";

export type AccordionGalleryItem = {
  image: string;
  label: string;
  link: string;
  alt: string;
};

function resolveStorageKeyUrl(storageKey: string): string | null {
  const storage = getStorageService();
  const cdnUrl = storage.getPublicUrl(storageKey);
  if (cdnUrl) {
    return cdnUrl;
  }

  const legacyMatch = storageKey.match(/^public\/legacy\/(.+)$/);
  if (legacyMatch) {
    return `/media/${legacyMatch[1]}`;
  }

  return null;
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

function staticFeaturedItems(): AccordionGalleryItem[] {
  return getStaticProjects()
    .filter((project) => Boolean(project.coverImage))
    .map((project) => ({
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

/**
 * Featured work panels for the homepage accordion.
 *
 * Prefers published, featured CMS projects with R2 cover media; falls back to
 * static `site.json` projects when Supabase is empty or unreachable.
 */
export async function getFeaturedAccordionItems(): Promise<AccordionGalleryItem[]> {
  try {
    const supabase = createPublishableClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        slug,
        title,
        location,
        sort_order,
        project_categories ( name ),
        media_assets!cover_media_id ( storage_key, alt_text, visibility )
      `,
      )
      .eq("status", "published")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return staticFeaturedItems();
    }

    const items = (data as CmsFeaturedRow[])
      .map((row) => {
        const asset = row.media_assets;
        if (!asset?.storage_key) {
          return null;
        }

        const image =
          asset.visibility === "public"
            ? resolveStorageKeyUrl(asset.storage_key)
            : null;

        if (!image) {
          return null;
        }

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

    return items.length > 0 ? items : staticFeaturedItems();
  } catch {
    return staticFeaturedItems();
  }
}
