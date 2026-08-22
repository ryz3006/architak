import type { Testimonial } from "@/content/static";

import type { ChromaGridItem } from "@/components/motion/chroma-grid";

const CHROMA_ACCENTS = [
  { border: "#c4a574", gradient: "linear-gradient(155deg, #3d3428 0%, #0a0a0a 72%)" },
  { border: "#a08860", gradient: "linear-gradient(175deg, #2e2924 0%, #0a0a0a 74%)" },
  { border: "#8b7355", gradient: "linear-gradient(145deg, #2a2520 0%, #0a0a0a 70%)" },
  { border: "#d4b896", gradient: "linear-gradient(195deg, #353028 0%, #0a0a0a 76%)" },
] as const;

export function getTestimonialChromaItems(items: Testimonial[]): ChromaGridItem[] {
  return items.map((item, index) => {
    const accent = CHROMA_ACCENTS[index % CHROMA_ACCENTS.length] as (typeof CHROMA_ACCENTS)[number];

    return {
      image: item.image,
      title: item.name,
      subtitle: item.role,
      location: item.location,
      quote: item.quote,
      borderColor: accent.border,
      gradient: accent.gradient,
    };
  });
}
