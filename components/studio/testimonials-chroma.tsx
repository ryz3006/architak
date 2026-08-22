"use client";

import type { Testimonial } from "@/content/static";
import { getTestimonialChromaItems } from "@/features/studio/testimonial-chroma-items";

import { ChromaGrid } from "@/components/motion/chroma-grid";

type TestimonialsChromaProps = {
  items: Testimonial[];
};

export function TestimonialsChroma({ items }: TestimonialsChromaProps) {
  const chromaItems = getTestimonialChromaItems(items);

  return (
    <div className="testimonials__chroma-wrap">
      <ChromaGrid
        items={chromaItems}
        className="testimonials__chroma"
        radius={280}
        damping={0.45}
        fadeOut={0.6}
        ease="power3.out"
        marquee
        marqueeSpeed={38}
      />
    </div>
  );
}
