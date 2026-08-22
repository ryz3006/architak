"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import type { HeroChapter, HeroImage, HeroJourneyResolved } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { persistHeroJourneyCookie } from "@/lib/hero/cookie-client";
import { computeHeroComposition } from "@/lib/hero/scroll-math";
import {
  getHeroViewportProfile,
  heroUsesMobileFocus,
  HERO_TRACK_VH,
  type HeroViewportProfile,
} from "@/lib/hero/viewport-profile";

import "@/styles/hero-chapters.css";

type ChapterId = "experience" | "space" | "feel";

type HeroChaptersProps = {
  journey: HeroJourneyResolved;
  chapters: HeroChapter[];
};

function chapterImage(journey: HeroJourneyResolved, chapterId: string): HeroImage {
  if (chapterId === "space") return journey.space;
  if (chapterId === "feel") return journey.feel;
  return journey.experience;
}

function HeroScene({
  chapter,
  image,
  priority,
  showEntrance,
  mobileFocus,
}: {
  chapter: HeroChapter;
  image: HeroImage;
  priority: boolean;
  showEntrance: boolean;
  mobileFocus: boolean;
}) {
  const focus = mobileFocus ? image.focus.mobile : image.focus.desktop;
  const [focusX, focusY] = focus.split(" ");
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
            sizes="(max-width: 48rem) 100vw, (max-width: 120rem) 60vw, 50vw"
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
  const profileRef = useRef<HeroViewportProfile>("wide");

  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<HeroViewportProfile>("wide");
  const [mobileFocus, setMobileFocus] = useState(false);

  const animated = !reduced;

  const syncViewport = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const nextProfile = getHeroViewportProfile(width, height);
    profileRef.current = nextProfile;
    setProfile(nextProfile);
    setMobileFocus(heroUsesMobileFocus(nextProfile, width, height));

    const root = rootRef.current;
    if (root) {
      root.dataset.profile = nextProfile;
      root.style.setProperty("--hero-track-height", `${HERO_TRACK_VH[nextProfile]}vh`);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    persistHeroJourneyCookie(journey.id);

    for (const src of [journey.space.src, journey.feel.src]) {
      const img = new window.Image();
      img.src = src;
    }

    syncViewport();
    window.addEventListener("resize", syncViewport, { passive: true });
    window.addEventListener("orientationchange", syncViewport);
    return () => {
      window.removeEventListener("resize", syncViewport);
      window.removeEventListener("orientationchange", syncViewport);
    };
  }, [journey.feel.src, journey.id, journey.space.src, syncViewport]);

  const applyComposition = useCallback(
    (progress: number) => {
      const root = rootRef.current;
      if (!root) return;

      const vars = computeHeroComposition(progress, profileRef.current);
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
    if (!animated) return;

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

    const onPointer = (clientX: number, clientY: number) => {
      const rect = composition.getBoundingClientRect();
      x = Math.max(-2, Math.min(2, ((clientX - rect.left) / rect.width - 0.5) * 4));
      y = Math.max(-2, Math.min(2, ((clientY - rect.top) / rect.height - 0.5) * 4));
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    const onMouseMove = (event: MouseEvent) => onPointer(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) onPointer(touch.clientX, touch.clientY);
    };

    composition.addEventListener("mousemove", onMouseMove);
    composition.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      composition.removeEventListener("mousemove", onMouseMove);
      composition.removeEventListener("touchmove", onTouchMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [animated]);

  return (
    <section
      className={`hero-root${animated ? "" : " is-static"}`}
      data-profile={profile}
      aria-label="Hero"
      ref={rootRef}
    >
      <div className="hero-track" ref={trackRef}>
        <div className="hero-stage">
          <div className="hero-composition" ref={compositionRef}>
            {chapters.map((chapter, index) => (
              <HeroScene
                key={chapter.id}
                chapter={chapter}
                image={chapterImage(journey, chapter.id)}
                priority={index === 0}
                showEntrance={mounted && animated && index === 0}
                mobileFocus={mobileFocus}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
