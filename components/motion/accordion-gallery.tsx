"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import type gsap from "gsap";

import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/accordion-gallery.css";

export type AccordionGalleryPanel = {
  image: string;
  label?: string;
  link?: string;
  alt?: string;
};

type AccordionGalleryProps = {
  items: AccordionGalleryPanel[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
};

export function AccordionGallery({
  items,
  defaultIndex = 2,
  accentColor = "#c4a574",
  overlayColor = "#0a0a0a",
  textColor = "#f5f2eb",
  height = 460,
  gap = 10,
  radius = 12,
  expandRatio = 0.52,
  orientation = "horizontal",
  duration = 0.6,
  ease = "power3.out",
  parallax = 0.5,
  tilt = 8,
  stagger = 0.06,
  trigger = "hover",
  showLabels = true,
  grayscale = true,
  className = "",
}: AccordionGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const textRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const gsapRef = useRef<typeof gsap | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);

  const vertical = orientation === "vertical";
  const count = items.length;
  const [active, setActive] = useState(() =>
    count > 0 ? Math.min(Math.max(defaultIndex, 0), count - 1) : 0,
  );
  const [gsapReady, setGsapReady] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    void import("gsap").then((mod) => {
      if (cancelled) return;
      gsapRef.current = mod.default;
      setGsapReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const applyLayout = useCallback(
    (animate: boolean) => {
      const gsap = gsapRef.current;
      const panels = panelRefs.current;
      if (!gsap || !panels.length || count === 0) return;

      const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
      const grow = count > 1 ? (ratio * (count - 1)) / (1 - ratio) : 1;
      const mediaSize = mediaSizeRef.current;

      tlRef.current?.kill();
      const dur = animate && !reduced ? duration : 0;
      const tl = gsap.timeline();

      panels.forEach((panel, index) => {
        if (!panel) return;

        const isActive = index === active;
        const media = mediaRefs.current[index];
        const bar = barRefs.current[index];
        const text = textRefs.current[index];

        const rot = isActive ? 0 : index < active ? tilt : -tilt;
        const rotProp = vertical ? { rotateX: -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - index));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;

          tl.to(
            media,
            {
              xPercent: -50,
              yPercent: -50,
              x: vertical ? 0 : isActive ? 0 : shift,
              y: vertical ? (isActive ? 0 : shift) : 0,
              "--ag-gray": gray,
              "--ag-dim": isActive ? 0 : 0.35,
              duration: dur,
              ease,
            },
            0,
          );
        }

        if (showLabels && bar && text) {
          if (isActive) {
            tl.to(
              [bar, text],
              {
                opacity: 1,
                x: 0,
                duration: dur,
                ease,
                stagger: reduced ? 0 : stagger,
              },
              0,
            );
          } else {
            tl.to([bar, text], { opacity: 0, x: -14, duration: dur * 0.6, ease }, 0);
          }
        }
      });

      tlRef.current = tl;
    },
    [
      active,
      count,
      duration,
      ease,
      expandRatio,
      grayscale,
      parallax,
      reduced,
      showLabels,
      stagger,
      tilt,
      vertical,
    ],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || count === 0) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const total = vertical ? rect.height : rect.width;
      const usable = Math.max(total - gap * (count - 1), 120);
      const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
      mediaSizeRef.current = size;
      el.style.setProperty("--ag-media-size", `${size}px`);
      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [applyLayout, count, expandRatio, gap, vertical]);

  useEffect(() => {
    if (!gsapReady) return;
    applyLayout(!firstRunRef.current);
    firstRunRef.current = false;
  }, [applyLayout, gsapReady]);

  useEffect(
    () => () => {
      tlRef.current?.kill();
    },
    [],
  );

  useEffect(() => {
    if (count === 0) return;
    setActive((current) => Math.min(current, count - 1));
  }, [count]);

  const handleEnter = (index: number) => {
    if (trigger === "hover") setActive(index);
  };

  const handleClick = (index: number, event: MouseEvent<HTMLElement>) => {
    if (index !== active) {
      event.preventDefault();
      setActive(index);
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index + 1) % count);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index - 1 + count) % count);
    }
  };

  if (count === 0) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className={`accordion-gallery${vertical ? " accordion-gallery--vertical" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ag-accent": accentColor,
          "--ag-overlay": overlayColor,
          "--ag-text": textColor,
          "--ag-gap": `${gap}px`,
          "--ag-radius": `${radius}px`,
          height: vertical ? `${Math.round(height * 1.6)}px` : `${height}px`,
        } as CSSProperties
      }
      role="list"
      aria-label="Featured work gallery"
    >
      {items.map((item, index) => {
        const isActive = index === active;
        const sharedProps = {
          ref: (el: HTMLElement | null) => {
            panelRefs.current[index] = el;
          },
          className: `ag-panel${isActive ? " ag-panel--active" : ""}`,
          style: { borderRadius: `${radius}px` },
          onClick: (event: MouseEvent<HTMLElement>) => handleClick(index, event),
          onMouseEnter: () => handleEnter(index),
          onFocus: () => setActive(index),
          onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleKeyDown(index, event),
          role: "listitem" as const,
          tabIndex: 0,
          "aria-current": isActive ? ("true" as const) : undefined,
          "aria-label": item.label,
        };

        const panelContent = (
          <>
            <span className="ag-panel__frame">
              <span
                className="ag-panel__media"
                ref={(el) => {
                  mediaRefs.current[index] = el;
                }}
              >
                <img src={item.image} alt={item.alt ?? item.label ?? ""} draggable={false} />
              </span>
              <span className="ag-panel__overlay" aria-hidden="true" />
            </span>
            {showLabels && item.label ? (
              <span className="ag-panel__label" aria-hidden="true">
                <span
                  className="ag-panel__bar"
                  ref={(el) => {
                    barRefs.current[index] = el;
                  }}
                />
                <span
                  className="ag-panel__text"
                  ref={(el) => {
                    textRefs.current[index] = el;
                  }}
                >
                  {item.label}
                </span>
              </span>
            ) : null}
          </>
        );

        if (item.link) {
          return (
            <a key={`${item.link}-${index}`} href={item.link} {...sharedProps}>
              {panelContent}
            </a>
          );
        }

        return (
          <div key={`${item.label ?? "panel"}-${index}`} {...sharedProps}>
            {panelContent}
          </div>
        );
      })}
    </div>
  );
}
