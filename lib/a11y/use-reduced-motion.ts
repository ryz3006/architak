"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Single source of truth for motion consent in JavaScript.
 *
 * The CSS block in styles/tokens.css collapses transition durations, but
 * JS-driven motion (GSAP, Lenis, WebGL loops) bypasses CSS entirely and must
 * consult this hook before starting.
 *
 * Defaults to `true` so the first paint is the calm variant; the effect then
 * relaxes it only when the user has expressed no preference against motion.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const query = window.matchMedia(QUERY);
    setReduced(query.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Coarse pointers and low-power devices should skip expensive parallax and
 * WebGL work even when the user has not opted out of motion.
 */
export function useHeavyMotionAllowed(): boolean {
  const reduced = useReducedMotion();
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const cores = navigator.hardwareConcurrency ?? 4;
    setCapable(finePointer && cores >= 4);
  }, []);

  return !reduced && capable;
}
