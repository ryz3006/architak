"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

/**
 * Smooth scroll island.
 *
 * Disabled entirely under prefers-reduced-motion. Never intercepts the skip
 * link or in-page focus scrolling — Lenis is configured to respect those.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let destroyed = false;
    let cleanup: (() => void) | undefined;

    void import("lenis").then(({ default: Lenis }) => {
      if (destroyed) return;

      const lenis = new Lenis({
        autoRaf: true,
        anchors: true,
      });

      cleanup = () => {
        lenis.destroy();
      };
    });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [reduced]);

  return null;
}
