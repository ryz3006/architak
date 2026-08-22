"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { HeroChapter, HeroImage, HeroJourneyResolved } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";
import { computeHeroComposition } from "@/lib/hero/scroll-math";
import { persistHeroJourneyCookie } from "@/lib/hero/cookie-client";

import "@/styles/hero-chapters.css";

type HeroChaptersProps = {
  journey: HeroJourneyResolved;
  chapters: HeroChapter[];
  tagline: string;
};

const CHAPTER_TARGETS = [0, 0.43, 0.72] as const;

function chapterImage(journey: HeroJourneyResolved, chapterId: string): HeroImage {
  if (chapterId === "space") return journey.space;
  if (chapterId === "feel") return journey.feel;
  return journey.experience;
}

function HeroImageLayer({
  image,
  chapter,
  priority = false,
  staticVisible = false,
}: {
  image: HeroImage;
  chapter: "experience" | "space" | "feel";
  priority?: boolean;
  staticVisible?: boolean;
}) {
  const [focusX, focusY] = image.focus.desktop.split(" ");

  return (
    <div
      className="hero-image-layer"
      data-chapter={chapter}
      data-static-visible={staticVisible ? "true" : undefined}
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
        sizes="(max-width: 48rem) 100vw, 55vw"
        className="hero-image-fill object-cover"
      />
    </div>
  );
}

function HeroCta({ hidden }: { hidden?: boolean }) {
  return (
    <div className={`hero-cta flex flex-wrap gap-4${hidden ? " is-hidden" : ""}`}>
      <Link
        href="/work"
        className="border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase"
      >
        View work
      </Link>
      <Link
        href="/contact"
        className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase transition-colors duration-[var(--duration-micro)] hover:border-accent hover:text-accent"
      >
        Enquire
      </Link>
    </div>
  );
}

function ChapterCopy({
  chapter,
  showEntrance,
  mobileActive,
}: {
  chapter: HeroChapter;
  showEntrance?: boolean;
  mobileActive?: boolean;
}) {
  return (
    <div
      className={`hero-chapter-copy${mobileActive ? " is-mobile-active" : ""}${showEntrance ? " hero-headline-enter" : ""}`}
      data-chapter={chapter.id}
    >
      <p className="hero-chapter-label">
        {chapter.index} / {chapter.label}
      </p>
      {chapter.id === "experience" ? (
        <h1 className="hero-chapter-headline">
          <span className="hero-headline-line block">{chapter.headline}</span>
          {chapter.headlineLine2 ? (
            <span className="hero-headline-line block">{chapter.headlineLine2}</span>
          ) : null}
        </h1>
      ) : (
        <h2 className="hero-chapter-headline">
          <span className="hero-headline-line block">{chapter.headline}</span>
          {chapter.headlineLine2 ? (
            <span className="hero-headline-line block">{chapter.headlineLine2}</span>
          ) : null}
        </h2>
      )}
      <p className="hero-chapter-support">{chapter.support}</p>
    </div>
  );
}

export function HeroChapters({ journey, chapters, tagline }: HeroChaptersProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const preloadedSpace = useRef(false);
  const preloadedFeel = useRef(false);
  const activeChapterRef = useRef(0);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [finePointer, setFinePointer] = useState(false);
  const [mobileActive, setMobileActive] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  const isStatic = reduced;

  useEffect(() => {
    setMounted(true);
    persistHeroJourneyCookie(journey.id);
    const mobileQuery = window.matchMedia("(max-width: 47.99rem)");
    const pointerQuery = window.matchMedia("(pointer: fine)");
    const sync = () => {
      setIsMobile(mobileQuery.matches);
      setFinePointer(pointerQuery.matches);
    };
    sync();
    mobileQuery.addEventListener("change", sync);
    pointerQuery.addEventListener("change", sync);
    return () => {
      mobileQuery.removeEventListener("change", sync);
      pointerQuery.removeEventListener("change", sync);
    };
  }, [journey.id]);

  const applyComposition = useCallback(
    (progress: number) => {
      const root = rootRef.current;
      if (!root) return;

      const vars = computeHeroComposition(progress);
      root.style.setProperty("--hero-progress", String(vars.progress));
      root.style.setProperty("--hero-split", String(vars.split));
      root.style.setProperty("--hero-type-x", `${vars.typeX}%`);
      root.style.setProperty("--hero-type-y", `${vars.typeY}%`);
      root.style.setProperty("--hero-type-scale", String(vars.typeScale));
      root.style.setProperty("--hero-type-max", `${vars.typeMaxWidth}rem`);
      root.style.setProperty("--hero-overlay", String(vars.overlayStrength));
      root.style.setProperty("--hero-cta-opacity", String(vars.ctaOpacity));
      root.style.setProperty("--hero-release", String(vars.release));
      root.style.setProperty("--hero-stillness", String(vars.stillness));
      root.style.setProperty("--hero-exp-weight", String(vars.expWeight));
      root.style.setProperty("--hero-space-weight", String(vars.spaceWeight));
      root.style.setProperty("--hero-feel-weight", String(vars.feelWeight));
      root.style.setProperty("--hero-exp-scale", String(vars.expScale * journey.experience.motion.zoom));
      root.style.setProperty(
        "--hero-space-scale",
        String(vars.spaceScale * journey.space.motion.zoom),
      );
      root.style.setProperty("--hero-feel-scale", String(vars.feelScale * journey.feel.motion.zoom));

      if (vars.activeChapter !== activeChapterRef.current) {
        activeChapterRef.current = vars.activeChapter;
        setActiveChapter(vars.activeChapter);
      }

      if (progress > 0.12 && !preloadedSpace.current) {
        preloadedSpace.current = true;
        const img = new window.Image();
        img.src = journey.space.src;
      }
      if (progress > 0.32 && !preloadedFeel.current) {
        preloadedFeel.current = true;
        const img = new window.Image();
        img.src = journey.feel.src;
      }
    },
    [journey.experience.motion.zoom, journey.feel.motion.zoom, journey.feel.src, journey.space.motion.zoom, journey.space.src],
  );

  useEffect(() => {
    if (isStatic || isMobile) return;

    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      const trackTop = track.offsetTop;
      const trackHeight = track.offsetHeight;
      const viewHeight = window.innerHeight;
      const scrollable = Math.max(1, trackHeight - viewHeight);
      const scrolled = window.scrollY - trackTop;
      const progress = Math.min(1, Math.max(0, scrolled / scrollable));
      applyComposition(progress);
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [applyComposition, isMobile, isStatic]);

  useEffect(() => {
    if (isStatic || !isMobile) return;

    const blocks = trackRef.current?.querySelectorAll<HTMLElement>("[data-mobile-chapter]");
    if (!blocks?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-mobile-chapter"));
            if (!Number.isNaN(index)) setMobileActive(index);
          }
        }
      },
      { threshold: 0.55 },
    );

    for (const block of blocks) observer.observe(block);
    return () => observer.disconnect();
  }, [isMobile, isStatic]);

  useEffect(() => {
    if (isStatic || !finePointer) return;

    const panel = imagePanelRef.current;
    const root = rootRef.current;
    if (!panel || !root) return;

    let rafId = 0;
    let targetX = 0;
    let targetY = 0;

    const apply = () => {
      rafId = 0;
      root.style.setProperty("--hero-pointer-x", String(targetX));
      root.style.setProperty("--hero-pointer-y", String(targetY));
    };

    const onMove = (event: MouseEvent) => {
      const rect = panel.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = Math.min(2, Math.max(-2, nx * 4));
      targetY = Math.min(2, Math.max(-2, ny * 4));
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    panel.addEventListener("mousemove", onMove);
    return () => {
      panel.removeEventListener("mousemove", onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [finePointer, isStatic]);

  const scrollToChapter = (index: number) => {
    const track = trackRef.current;
    const target = CHAPTER_TARGETS[index];
    if (!track || isStatic || isMobile || target === undefined) return;
    const trackTop = track.offsetTop;
    const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
    window.scrollTo({
      top: trackTop + scrollable * target,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  if (isStatic) {
    return (
      <section className="hero-root hero-track is-static" aria-label="Hero">
        <div className="hero-stage page-frame">
          <p className="hero-tagline pt-fluid-lg">{tagline}</p>
          {chapters.map((chapter, index) => (
            <article key={chapter.id} className="hero-chapter-block">
              <div className="hero-text-panel">
                <ChapterCopy chapter={chapter} />
              </div>
              <div className="hero-image-panel">
                <HeroImageLayer
                  image={chapterImage(journey, chapter.id)}
                  chapter={chapter.id as "experience" | "space" | "feel"}
                  priority={index === 0}
                  staticVisible
                />
              </div>
            </article>
          ))}
          <HeroCta />
        </div>
      </section>
    );
  }

  if (isMobile) {
    return (
      <section className="hero-root" aria-label="Hero" ref={rootRef}>
        <div className="hero-track is-static" ref={trackRef}>
          <div className="hero-stage page-frame">
            <p className="hero-tagline pt-fluid-lg">{tagline}</p>
            {chapters.map((chapter, index) => (
              <article
                key={chapter.id}
                className="hero-chapter-block"
                data-mobile-chapter={index}
                style={{ minHeight: index === 0 ? "min(100dvh, auto)" : "85vh" }}
              >
                <div
                  className="hero-image-panel"
                  style={index === 0 ? { minHeight: "42vh", maxHeight: "48vh" } : undefined}
                >
                  <HeroImageLayer
                    image={chapterImage(journey, chapter.id)}
                    chapter={chapter.id as "experience" | "space" | "feel"}
                    priority={index === 0}
                    staticVisible
                  />
                </div>
                <div className="hero-text-panel">
                  <ChapterCopy chapter={chapter} showEntrance={mounted && index === 0} />
                  {index === 0 ? <HeroCta /> : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-root" aria-label="Hero" ref={rootRef}>
      <div className="hero-track" ref={trackRef}>
        <div className="hero-stage">
          <nav className="hero-progress" aria-label="Hero chapters">
            {chapters.map((chapter, index) => (
              <div key={chapter.id}>
                <button
                  type="button"
                  className={`hero-progress-item${activeChapter === index ? " is-active" : ""}`}
                  aria-current={activeChapter === index ? "step" : undefined}
                  onClick={() => scrollToChapter(index)}
                >
                  <span>{chapter.index}</span>
                  <span className="hero-progress-bar" aria-hidden="true" />
                </button>
                {index < chapters.length - 1 ? (
                  <span className="hero-progress-connector" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </nav>

          <div className="hero-composition">
            <div className="hero-text-panel">
              <p className="hero-tagline">{tagline}</p>
              {chapters.map((chapter, index) => (
                <ChapterCopy
                  key={chapter.id}
                  chapter={chapter}
                  showEntrance={mounted && index === 0}
                />
              ))}
              <HeroCta hidden={activeChapter !== 0} />
            </div>

            <div className="hero-image-panel" ref={imagePanelRef}>
              <div className="hero-scrim" aria-hidden="true" />
              <HeroImageLayer
                image={journey.experience}
                chapter="experience"
                priority
              />
              <HeroImageLayer image={journey.space} chapter="space" />
              <HeroImageLayer image={journey.feel} chapter="feel" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
