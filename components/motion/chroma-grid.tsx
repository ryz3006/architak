"use client";

import { useCallback, useEffect, useMemo, useRef, type CSSProperties, type PointerEvent } from "react";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/chroma-grid.css";

export type ChromaGridItem = {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  location?: string;
  quote?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
};

type ChromaGridProps = {
  items: ChromaGridItem[];
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
  /** When true, cards scroll horizontally in an infinite marquee loop. */
  marquee?: boolean;
  /** Marquee travel speed in pixels per second. */
  marqueeSpeed?: number;
};

export function ChromaGrid({
  items,
  className = "",
  radius = 300,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
  marquee = false,
  marqueeSpeed = 42,
}: ChromaGridProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const setX = useRef<((value: number) => void) | null>(null);
  const setY = useRef<((value: number) => void) | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const marqueeTweenRef = useRef<{ pause: () => void; resume: () => void; kill: () => void } | null>(null);
  const reduced = useReducedMotion();

  const loopItems = useMemo(() => {
    if (!marquee || items.length === 0) return items;
    return [...items, ...items];
  }, [items, marquee]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduced) return;

    let cancelled = false;

    void import("gsap").then(({ gsap }) => {
      if (cancelled || !rootRef.current) return;

      setX.current = gsap.quickSetter(rootRef.current, "--x", "px") as (value: number) => void;
      setY.current = gsap.quickSetter(rootRef.current, "--y", "px") as (value: number) => void;

      const { width, height } = rootRef.current.getBoundingClientRect();
      pos.current = { x: width / 2, y: height / 2 };
      setX.current(pos.current.x);
      setY.current(pos.current.y);
    });

    return () => {
      cancelled = true;
    };
  }, [reduced]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !marquee || reduced || items.length === 0) return;

    let cancelled = false;

    void import("gsap").then(({ gsap }) => {
      if (cancelled || !trackRef.current) return;

      const halfWidth = trackRef.current.scrollWidth / 2;
      if (halfWidth <= 0) return;

      marqueeTweenRef.current?.kill();
      gsap.set(trackRef.current, { x: 0 });

      marqueeTweenRef.current = gsap.to(trackRef.current, {
        x: -halfWidth,
        duration: halfWidth / marqueeSpeed,
        ease: "none",
        repeat: -1,
      });
    });

    return () => {
      cancelled = true;
      marqueeTweenRef.current?.kill();
      marqueeTweenRef.current = null;
    };
  }, [items, marquee, marqueeSpeed, reduced, loopItems.length]);

  const moveTo = useCallback(
    (x: number, y: number) => {
      if (reduced) return;

      void import("gsap").then(({ gsap }) => {
        gsap.to(pos.current, {
          x,
          y,
          duration: damping,
          ease,
          onUpdate: () => {
            setX.current?.(pos.current.x);
            setY.current?.(pos.current.y);
          },
          overwrite: true,
        });
      });
    },
    [damping, ease, reduced],
  );

  const handleMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const rect = root.getBoundingClientRect();
      moveTo(event.clientX - rect.left, event.clientY - rect.top);

      void import("gsap").then(({ gsap }) => {
        if (fadeRef.current) {
          gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
        }
      });
    },
    [moveTo, reduced],
  );

  const handleLeave = useCallback(() => {
    if (reduced) return;

    void import("gsap").then(({ gsap }) => {
      if (fadeRef.current) {
        gsap.to(fadeRef.current, {
          opacity: 1,
          duration: fadeOut,
          overwrite: true,
        });
      }
    });

    marqueeTweenRef.current?.resume();
  }, [fadeOut, reduced]);

  const handleEnter = useCallback(() => {
    marqueeTweenRef.current?.pause();
  }, []);

  const handleCardMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  }, []);

  const handleCardClick = useCallback((url?: string) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  if (items.length === 0) {
    return null;
  }

  const rootStyle = {
    "--r": `${radius}px`,
  } as CSSProperties;

  const cards = loopItems.map((item, index) => {
    const isDuplicate = marquee && index >= items.length;

    return (
      <article
        key={`${item.title}-${index}`}
        className="chroma-card"
        aria-hidden={isDuplicate ? true : undefined}
        onPointerMove={handleCardMove}
        onClick={() => handleCardClick(item.url)}
        style={
          {
            "--card-border": item.borderColor ?? "var(--color-accent)",
            "--card-gradient": item.gradient ?? "linear-gradient(165deg, var(--color-accent), var(--color-background))",
            cursor: item.url ? "pointer" : "default",
          } as CSSProperties
        }
      >
        <div className="chroma-img-wrapper">
          <img
            src={item.image}
            alt={isDuplicate ? "" : `${item.title} — ${item.subtitle}`}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>
        <footer className="chroma-info">
          <h3 className="chroma-info__name">{item.title}</h3>
          {item.handle ? <span className="chroma-info__meta">{item.handle}</span> : null}
          <p className="chroma-info__role">{item.subtitle}</p>
          {item.location ? <span className="chroma-info__location">{item.location}</span> : null}
          {item.quote ? (
            <blockquote className="chroma-info__quote">
              <p>&ldquo;{item.quote}&rdquo;</p>
            </blockquote>
          ) : null}
        </footer>
      </article>
    );
  });

  return (
    <div
      ref={rootRef}
      className={`chroma-grid${marquee ? " chroma-grid--marquee" : ""}${reduced ? " chroma-grid--reduced" : ""}${className ? ` ${className}` : ""}`}
      style={rootStyle}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={handleLeave}
    >
      {marquee ? (
        <div ref={trackRef} className="chroma-grid__track">
          {cards}
        </div>
      ) : (
        cards
      )}
      {!reduced ? (
        <>
          <div className="chroma-overlay" aria-hidden="true" />
          <div ref={fadeRef} className="chroma-fade" aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}
