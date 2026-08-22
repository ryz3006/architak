"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

export type StudioRevealVariant = "rise" | "left" | "right" | "center" | "fade";

type StudioRevealProps = {
  children: ReactNode;
  variant?: StudioRevealVariant;
  delay?: number;
  className?: string;
};

const VARIANT_FROM: Record<
  StudioRevealVariant,
  { autoAlpha: number; x?: number; y?: number; scale?: number }
> = {
  rise: { autoAlpha: 0, y: 48 },
  left: { autoAlpha: 0, x: -56, y: 24 },
  right: { autoAlpha: 0, x: 56, y: 24 },
  center: { autoAlpha: 0, y: 32, scale: 0.98 },
  fade: { autoAlpha: 0 },
};

export function StudioReveal({
  children,
  variant = "rise",
  delay = 0,
  className = "",
}: StudioRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cancelled || !ref.current) return;

      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      const from = VARIANT_FROM[variant];

      ctx = gsap.context(() => {
        gsap.fromTo(ref.current, from, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          duration: 1.05,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 82%",
            once: true,
          },
        });
      }, ref);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [delay, reduced, variant]);

  return (
    <div ref={ref} className={`studio-reveal studio-reveal--${variant}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
