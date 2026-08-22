import "server-only";

import { getFeaturedWorkVideos } from "@/content/static";
import { isR2Configured } from "@/lib/env";
import { getStorageService } from "@/lib/storage/r2";

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

/** Featured work reels for homepage and studio carousel. */
export function resolveFeaturedWorkVideos(): ResolvedFeaturedWorkVideo[] {
  return getFeaturedWorkVideos().map((item) => {
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

export function toDepthCarouselItems(videos: ResolvedFeaturedWorkVideo[]): DepthCarouselItem[] {
  return videos.map((item) => ({
    video: item.videoUrl,
    poster: item.posterUrl,
    alt: item.alt,
  }));
}
