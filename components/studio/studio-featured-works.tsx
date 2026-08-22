"use client";

import { DepthCarousel } from "@/components/motion/depth-carousel";
import type { DepthCarouselItem } from "@/features/work/featured-videos";

import "@/styles/studio-featured-works.css";

type StudioFeaturedWorksProps = {
  eyebrow: string;
  headline: string;
  support: string;
  items: DepthCarouselItem[];
};

export function StudioFeaturedWorks({
  eyebrow,
  headline,
  support,
  items,
}: StudioFeaturedWorksProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="studio-featured-works page-frame" aria-labelledby="studio-featured-works-heading">
      <header className="studio-featured-works__intro">
        <p className="studio-eyebrow">{eyebrow}</p>
        <h2 id="studio-featured-works-heading" className="studio-featured-works__headline display text-display-md">
          {headline}
        </h2>
        <p className="studio-featured-works__support measure">{support}</p>
      </header>

      <div className="studio-featured-works__stage">
        <DepthCarousel
          items={items}
          depth={220}
          spread={90}
          tilt={22}
          tiltDirection="right"
          perspective={1400}
          visibleCards={4}
          falloff={0.2}
          blur={6}
          autoplay
          loop
        />
      </div>
    </section>
  );
}
