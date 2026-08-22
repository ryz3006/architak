"use client";

import type { ResolvedFeaturedWorkVideo } from "@/features/work/featured-videos";

import "@/styles/featured-work-reel.css";

type FeaturedWorkReelProps = {
  items: ResolvedFeaturedWorkVideo[];
};

export function FeaturedWorkReel({ items }: FeaturedWorkReelProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="featured-work-reel">
      {items.map((item) => (
        <article key={item.id} className="featured-work-reel__item">
          <div className="featured-work-reel__media">
            <video
              className="featured-work-reel__video"
              controls
              playsInline
              preload="metadata"
              poster={item.posterUrl}
              aria-label={item.alt}
            >
              <source src={item.videoUrl} type={item.mimeType} />
            </video>
          </div>
          <div className="featured-work-reel__copy">
            <p className="featured-work-reel__meta">
              {item.title} · {item.category}
            </p>
            <p className="featured-work-reel__summary">{item.summary}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
