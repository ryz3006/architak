import "server-only";

import { getFeaturedWorkVideos, type FeaturedWorkVideo } from "@/content/static";
import { getFeaturedWorkVideos as getCmsFeaturedWorkVideos } from "@/features/content/site-content";
import { isR2Configured } from "@/lib/env";
import { getStorageService } from "@/lib/storage/r2";
import { getPublicWebsiteSectionConfig } from "@/features/website/public";

export type ResolvedFeaturedWorkVideo = {
  id: string;
  title: string;
  category: string;
  location: string;
  summary: string;
  videoUrl: string;
  posterUrl: string;
  mimeType: string;
  alt: string;
};

export type DepthCarouselItem = {
  video?: string;
  image?: string;
  poster?: string;
  alt?: string;
};

function resolveVideoUrl(objectPath: string, localPath: string): string {
  if (isR2Configured()) {
    const storageKey = `public/${objectPath.replace(/^public\//, "")}`;
    const cdnUrl = getStorageService().getPublicUrl(storageKey);
    if (cdnUrl) {
      return cdnUrl;
    }
  }

  return localPath.startsWith("/") ? localPath : `/${localPath}`;
}

function resolveAllVideos(
  videos: FeaturedWorkVideo[] = getFeaturedWorkVideos(),
): ResolvedFeaturedWorkVideo[] {
  return videos.map((item) => {
    const videoUrl = resolveVideoUrl(item.video.objectPath, item.video.localPath);
    const posterUrl = item.poster.startsWith("/") ? item.poster : `/${item.poster}`;

    return {
      id: item.id,
      title: item.title,
      category: item.category,
      location: item.location,
      summary: item.summary,
      videoUrl,
      posterUrl,
      mimeType: item.video.mimeType,
      alt: `${item.title} — ${item.category} interior in ${item.location}`,
    };
  });
}

/** Featured work reels for homepage and studio carousel. */
export function resolveFeaturedWorkVideos(): ResolvedFeaturedWorkVideo[] {
  return resolveAllVideos();
}

/** Async variant that reads CMS video content and respects the homepageVideoIds order. */
export async function resolveFeaturedWorkVideosFromCms(): Promise<ResolvedFeaturedWorkVideo[]> {
  const all = resolveAllVideos(await getCmsFeaturedWorkVideos());
  try {
    const config = await getPublicWebsiteSectionConfig();
    if (config.homepageVideoIds.length === 0) return all;

    const byId = new Map(all.map((v) => [v.id, v]));
    const ordered = config.homepageVideoIds
      .map((id) => byId.get(id))
      .filter((v): v is ResolvedFeaturedWorkVideo => Boolean(v));

    return ordered.length > 0 ? ordered : all;
  } catch {
    return all;
  }
}

export function toDepthCarouselItems(videos: ResolvedFeaturedWorkVideo[]): DepthCarouselItem[] {
  return videos.map((item) => ({
    video: item.videoUrl,
    poster: item.posterUrl,
    alt: item.alt,
  }));
}
