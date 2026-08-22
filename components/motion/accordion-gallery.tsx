"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
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
  const stackedRef = useRef(false);

  const vertical = orientation === "vertical";
  const count = items.length;
  const [active, setActive] = useState(() =>
    count > 0 ? Math.min(Math.max(defaultIndex, 0), count - 1) : 0,
  );
  const [gsapReady, setGsapReady] = useState(false);
  const [stacked, setStacked] = useState(false);
  const reduced = useReducedMotion();

  const layoutVertical = vertical || stacked;

  useEffect(() => {
    const query = window.matchMedia("(max-width: 40rem)");
    const sync = () => {
      stackedRef.current = query.matches;
      setStacked(query.matches);
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

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

        const rot = isActive || stacked ? 0 : index < active ? tilt : -tilt;
        const rotProp = layoutVertical ? { rotateX: stacked ? 0 : -rot } : { rotateY: rot };

        tl.to(panel, { flexGrow: isActive ? grow : 1, ...rotProp, duration: dur, ease }, 0);

        if (media) {
          const drift = Math.max(-1.5, Math.min(1.5, active - index));
          const shift = drift * parallax * mediaSize * 0.06;
          const gray = grayscale ? (isActive ? 0 : 1) : 0;

          if (stacked) {
            tl.to(
              media,
              {
                xPercent: 0,
                yPercent: 0,
                x: 0,
                y: isActive ? 0 : shift,
                "--ag-gray": gray,
                "--ag-dim": isActive ? 0 : 0.35,
                duration: dur,
                ease,
              },
              0,
            );
          } else {
            tl.to(
              media,
              {
                xPercent: -50,
                yPercent: -50,
                x: layoutVertical ? 0 : isActive ? 0 : shift,
                y: layoutVertical ? (isActive ? 0 : shift) : 0,
                "--ag-gray": gray,
                "--ag-dim": isActive ? 0 : 0.35,
                duration: dur,
                ease,
              },
              0,
            );
          }
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
      stacked,
      tilt,
      layoutVertical,
    ],
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el || count === 0) return;

    const measure = () => {
      const isStacked = stackedRef.current;
      const rect = el.getBoundingClientRect();

      if (isStacked) {
        const collapsed = Math.max(72, Math.round(window.innerHeight * 0.09));
        const expanded = Math.max(
          240,
          Math.min(window.innerHeight * 0.52, rect.width * 1.35),
        );
        const total = collapsed * (count - 1) + expanded + gap * (count - 1);

        mediaSizeRef.current = expanded;
        el.style.height = `${Math.round(total)}px`;
        el.style.setProperty("--ag-media-size", `${Math.round(expanded)}px`);
        el.style.setProperty("--ag-collapsed-size", `${collapsed}px`);
      } else {
        el.style.removeProperty("--ag-collapsed-size");
        const total = layoutVertical ? rect.height : rect.width;
        const usable = Math.max(total - gap * (count - 1), 120);
        const size = Math.max(140, usable * Math.min(Math.max(expandRatio, 0.2), 0.9) * 1.22);
        mediaSizeRef.current = size;
        el.style.setProperty("--ag-media-size", `${size}px`);
        el.style.height = layoutVertical ? `${Math.round(height * 1.6)}px` : `${height}px`;
      }

      applyLayout(!firstRunRef.current);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [applyLayout, count, expandRatio, gap, height, layoutVertical, stacked]);

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

  useEffect(() => {
    if (!stacked || count === 0) return;

    let rafId = 0;

    const updateActiveFromScroll = () => {
      rafId = 0;
      const panels = panelRefs.current;
      const anchor = window.innerHeight * 0.42;
      let nextIndex = 0;
      let closest = Number.POSITIVE_INFINITY;

      panels.forEach((panel, index) => {
        if (!panel) return;
        const rect = panel.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - anchor);
        if (distance < closest) {
          closest = distance;
          nextIndex = index;
        }
      });

      setActive((current) => (current === nextIndex ? current : nextIndex));
    };

    const onScroll = () => {
      if (!rafId) rafId = window.requestAnimationFrame(updateActiveFromScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    updateActiveFromScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [count, stacked]);

  const handleEnter = (index: number) => {
    if (trigger === "hover") setActive(index);
  };

  const handleFocus = (index: number) => {
    if (!stacked) setActive(index);
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
      className={`accordion-gallery${layoutVertical ? " accordion-gallery--vertical" : ""}${stacked ? " accordion-gallery--stacked" : ""}${className ? ` ${className}` : ""}`}
      style={
        {
          "--ag-accent": accentColor,
          "--ag-overlay": overlayColor,
          "--ag-text": textColor,
          "--ag-gap": `${gap}px`,
          "--ag-radius": `${radius}px`,
          ...(stacked
            ? {}
            : { height: layoutVertical ? `${Math.round(height * 1.6)}px` : `${height}px` }),
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
          onMouseEnter: () => handleEnter(index),
          onFocus: () => handleFocus(index),
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
                <Image
                  src={item.image}
                  alt={item.alt ?? item.label ?? ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 48rem) 50vw, 33vw"
                />
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
