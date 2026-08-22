"use client";

import { useEffect, useState } from "react";

import { AccordionGallery } from "@/components/motion/accordion-gallery";
import type { AccordionGalleryItem } from "@/features/work/accordion-items";

type FeaturedWorkAccordionProps = {
  items: AccordionGalleryItem[];
};

export function FeaturedWorkAccordion({ items }: FeaturedWorkAccordionProps) {
  const defaultIndex = items.length > 2 ? 2 : Math.max(0, Math.floor((items.length - 1) / 2));
  const [coarsePointer, setCoarsePointer] = useState(true);

  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarsePointer(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return (
    <AccordionGallery
      items={items}
      defaultIndex={defaultIndex}
      accentColor="var(--color-accent)"
      overlayColor="var(--color-background)"
      textColor="var(--color-foreground)"
      expandRatio={coarsePointer ? 0.58 : 0.52}
      trigger="hover"
      height={460}
      gap={10}
      radius={12}
      parallax={coarsePointer ? 0.35 : 0.5}
      tilt={coarsePointer ? 0 : 6}
      className="mt-12"
    />
  );
}
