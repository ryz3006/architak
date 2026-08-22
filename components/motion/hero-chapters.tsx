"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { BrandLockup } from "@/components/layout/brand-lockup";
import type { HeroChapter, HeroImage, HeroJourneyResolved } from "@/content/static";
import { getStaticSite } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { persistHeroJourneyCookie } from "@/lib/hero/cookie-client";
import { computeHeroComposition } from "@/lib/hero/scroll-math";

import "@/styles/hero-chapters.css";

type ChapterId = "experience" | "space" | "feel";

type HeroChaptersProps = {
  journey: HeroJourneyResolved;
  chapters: HeroChapter[];
};

/** Matches the pinning breakpoint in styles/hero-chapters.css. */
const PINNED_QUERY = "(min-width: 64rem)";

const BRAND_CSS_VARS = [
  "--hero-brand-morph",
  "--hero-brand-opacity",
  "--hero-brand-blur",
  "--hero-brand-scale",
] as const;

function chapterImage(journey: HeroJourneyResolved, chapterId: string): HeroImage {
  if (chapterId === "space") return journey.space;
  if (chapterId === "feel") return journey.feel;
  return journey.experience;
}

function syncBrandVars(values: Record<(typeof BRAND_CSS_VARS)[number], string>) {
  const root = document.documentElement;
  for (const name of BRAND_CSS_VARS) {
    root.style.setProperty(name, values[name]);
  }
}

function clearBrandVars() {
  const root = document.documentElement;
  for (const name of BRAND_CSS_VARS) {
    root.style.removeProperty(name);
  }
}

function HeroScene({
  chapter,
  image,
  priority,
  showEntrance,
}: {
  chapter: HeroChapter;
  image: HeroImage;
  priority: boolean;
  showEntrance: boolean;
}) {
  const [focusX, focusY] = image.focus.desktop.split(" ");
  const Headline = chapter.id === "experience" ? "h1" : "h2";

  return (
    <article className="hero-scene" data-chapter={chapter.id as ChapterId}>
      <div className="hero-scene-text">
        <div className={`hero-copy${showEntrance ? " hero-headline-enter" : ""}`}>
          <p className="hero-chapter-label">{chapter.label}</p>
          <Headline className="hero-chapter-headline">
            <span className="hero-headline-line">{chapter.headline}</span>
            {chapter.headlineLine2 ? (
              <span className="hero-headline-line">{chapter.headlineLine2}</span>
            ) : null}
          </Headline>
          <p className="hero-chapter-support">{chapter.support}</p>
        </div>
      </div>

      <div className="hero-scene-image">
        <div
          className="hero-image-layer"
          style={
            {
              "--hero-focal-x": focusX,
              "--hero-focal-y": focusY,
            } as React.CSSProperties
          }
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            loading={priority ? undefined : "eager"}
            sizes="(max-width: 64rem) 100vw, 60vw"
            className="object-cover"
          />
        </div>
        <div className="hero-scrim" aria-hidden="true" />
      </div>
    </article>
  );
}

export function HeroChapters({ journey, chapters }: HeroChaptersProps) {
  const rootRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const compositionRef = useRef<HTMLDivElement>(null);
  const preloadedSpace = useRef(false);
  const preloadedFeel = useRef(false);

  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  const tagline = getStaticSite().studio.tagline;
  const animated = pinned && !reduced;

  useEffect(() => {
    setMounted(true);
    persistHeroJourneyCookie(journey.id);

    for (const src of [journey.space.src, journey.feel.src]) {
      const img = new window.Image();
      img.src = src;
    }

    const pinnedQuery = window.matchMedia(PINNED_QUERY);
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const sync = () => {
      setPinned(pinnedQuery.matches);
      setFinePointer(pointerQuery.matches);
    };

    sync();
    pinnedQuery.addEventListener("change", sync);
    pointerQuery.addEventListener("change", sync);
    return () => {
      pinnedQuery.removeEventListener("change", sync);
      pointerQuery.removeEventListener("change", sync);
    };
  }, [journey.feel.src, journey.id, journey.space.src]);

  useEffect(() => {
    if (animated) return;
    clearBrandVars();
  }, [animated]);

  useEffect(() => {
    return () => {
      clearBrandVars();
    };
  }, []);

  const applyComposition = useCallback(
    (progress: number) => {
      const root = rootRef.current;
      if (!root) return;

      const vars = computeHeroComposition(progress);
      const style = root.style;

      style.setProperty("--hero-progress", String(vars.progress));
      style.setProperty("--hero-split", String(vars.split));
      style.setProperty("--hero-type-x", `${vars.typeX}%`);
      style.setProperty("--hero-type-y", `${vars.typeY}%`);
      style.setProperty("--hero-type-scale", String(vars.typeScale));
      style.setProperty("--hero-type-max", `${vars.typeMaxWidth}rem`);
      style.setProperty("--hero-overlay", String(vars.overlayStrength));
      style.setProperty("--hero-release", String(vars.release));
      style.setProperty("--hero-exp-weight", String(vars.expWeight));
      style.setProperty("--hero-space-weight", String(vars.spaceWeight));
      style.setProperty("--hero-feel-weight", String(vars.feelWeight));
      style.setProperty(
        "--hero-exp-scale",
        String(vars.expScale * journey.experience.motion.zoom),
      );
      style.setProperty("--hero-space-scale", String(vars.spaceScale * journey.space.motion.zoom));
      style.setProperty("--hero-feel-scale", String(vars.feelScale * journey.feel.motion.zoom));
      style.setProperty("--hero-brand-morph", String(vars.brandMorph));
      style.setProperty("--hero-brand-opacity", String(vars.brandOpacity));
      style.setProperty("--hero-brand-blur", `${vars.brandBlur}px`);
      style.setProperty("--hero-brand-scale", String(vars.brandScale));

      syncBrandVars({
        "--hero-brand-morph": String(vars.brandMorph),
        "--hero-brand-opacity": String(vars.brandOpacity),
        "--hero-brand-blur": `${vars.brandBlur}px`,
        "--hero-brand-scale": String(vars.brandScale),
      });

      if (progress > 0.1 && !preloadedSpace.current) {
        preloadedSpace.current = true;
        new window.Image().src = journey.space.src;
      }
      if (progress > 0.3 && !preloadedFeel.current) {
        preloadedFeel.current = true;
        new window.Image().src = journey.feel.src;
      }
    },
    [
      journey.experience.motion.zoom,
      journey.feel.motion.zoom,
      journey.feel.src,
      journey.space.motion.zoom,
      journey.space.src,
    ],
  );

  useEffect(() => {
    if (!animated) return;

    const track = trackRef.current;
    if (!track) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
      const scrolled = window.scrollY - track.offsetTop;
      applyComposition(Math.min(1, Math.max(0, scrolled / scrollable)));
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [animated, applyComposition]);

  useEffect(() => {
    if (!animated || !finePointer) return;

    const composition = compositionRef.current;
    const root = rootRef.current;
    if (!composition || !root) return;

    let rafId = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      rafId = 0;
      root.style.setProperty("--hero-pointer-x", String(x));
      root.style.setProperty("--hero-pointer-y", String(y));
    };

    const onMove = (event: MouseEvent) => {
      const rect = composition.getBoundingClientRect();
      x = Math.max(-2, Math.min(2, ((event.clientX - rect.left) / rect.width - 0.5) * 4));
      y = Math.max(-2, Math.min(2, ((event.clientY - rect.top) / rect.height - 0.5) * 4));
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    composition.addEventListener("mousemove", onMove);
    return () => {
      composition.removeEventListener("mousemove", onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [animated, finePointer]);

  return (
    <section className="hero-root" aria-label="Hero" ref={rootRef}>
      <div className="hero-track" ref={trackRef}>
        <div className="hero-stage">
          <div className="hero-composition" ref={compositionRef}>
            {animated ? (
              <div className="hero-brand-watermark" aria-hidden="true">
                <BrandLockup tagline={tagline} className="brand-lockup brand-lockup--watermark" />
              </div>
            ) : null}
            {chapters.map((chapter, index) => (
              <HeroScene
                key={chapter.id}
                chapter={chapter}
                image={chapterImage(journey, chapter.id)}
                priority={index === 0}
                showEntrance={mounted && !reduced && index === 0}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
