"use client";

import { AccordionGallery } from "@/components/motion/accordion-gallery";
import type { AccordionGalleryItem } from "@/features/work/accordion-items";

type FeaturedWorkAccordionProps = {
  items: AccordionGalleryItem[];
};

export function FeaturedWorkAccordion({ items }: FeaturedWorkAccordionProps) {
  const defaultIndex = items.length > 2 ? 2 : Math.max(0, Math.floor((items.length - 1) / 2));

  return (
    <AccordionGallery
      items={items}
      defaultIndex={defaultIndex}
      accentColor="var(--color-accent)"
      overlayColor="var(--color-background)"
      textColor="var(--color-foreground)"
      expandRatio={0.52}
      trigger="hover"
      height={460}
      gap={10}
      radius={12}
      parallax={0.5}
      tilt={6}
      className="mt-12"
    />
  );
}
