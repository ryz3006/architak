"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import type { DriftWallItem } from "@/components/motion/drift-wall";
import type { SpaceStory } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/space-story.css";

const DriftWall = dynamic(
  () => import("@/components/motion/drift-wall").then((mod) => mod.DriftWall),
  { ssr: false, loading: () => null },
);

type SpaceStoryProps = {
  story: SpaceStory;
  images: DriftWallItem[];
};

function useDriftColumns(): number {
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      if (width < 480) setColumns(3);
      else if (width < 768) setColumns(4);
      else setColumns(5);
    };

    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => window.removeEventListener("resize", sync);
  }, []);

  return columns;
}

export function SpaceStorySection({ story, images }: SpaceStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();
  const driftColumns = useDriftColumns();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) {
      stepRefs.current.forEach((step) => step?.setAttribute("data-state", "active"));
      return;
    }

    const steps = stepRefs.current.filter(Boolean) as HTMLLIElement[];
    if (steps.length === 0) return;

    const setLineProgress = () => {
      const activeIndex = steps.findIndex((step) => step.dataset.state === "active");
      const progress =
        activeIndex <= 0 ? 0.2 : activeIndex >= steps.length - 1 ? 1 : 0.2 + (activeIndex / (steps.length - 1)) * 0.8;
      section.style.setProperty("--story-line", String(progress));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLLIElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.42) {
            target.dataset.state = "active";
          } else if (entry.boundingClientRect.top < 0) {
            target.dataset.state = "past";
          } else {
            target.dataset.state = "future";
          }
        });
        setLineProgress();
      },
      {
        root: null,
        threshold: [0.15, 0.42, 0.65],
        rootMargin: "-12% 0px -28% 0px",
      },
    );

    steps.forEach((step) => observer.observe(step));
    steps[0]?.setAttribute("data-state", "active");
    setLineProgress();

    return () => observer.disconnect();
  }, [reduced, story.steps.length]);

  return (
    <section ref={sectionRef} className="space-story" aria-labelledby="space-story-title">
      <div className="space-story__background">
        {images.length > 0 ? (
          <DriftWall
            items={images}
            ambient
            columns={driftColumns}
            tileWidth={200}
            tileHeight={132}
            gap={18}
            tilt={16}
            turn={-14}
            perspective={1200}
            depth={120}
            speed={42}
            direction="up"
            variance={0.45}
            parallax={0.6}
            lift={64}
            fade={0.6}
            dim={0.55}
            overlayColor="#060010"
          />
        ) : null}
      </div>
      <div className="space-story__atmosphere" aria-hidden="true" />

      <div className="space-story__content">
        <header className="space-story__intro">
          <p className="space-story__eyebrow">{story.eyebrow}</p>
          <h2 id="space-story-title" className="space-story__headline display">
            {story.headline}
          </h2>
          <p className="space-story__support">{story.support}</p>
        </header>

        <div className="space-story__connector" aria-hidden="true" />

        <ol className="space-story__steps">
          {story.steps.map((step, index) => (
            <li
              key={step.step}
              ref={(element) => {
                stepRefs.current[index] = element;
              }}
              className="space-story__step"
              data-align={step.align}
              data-state={index === 0 ? "active" : "future"}
            >
              <p className="space-story__index">{step.step}</p>
              <h3 className="space-story__phrase">{step.phrase}</h3>
              <p className="space-story__copy">{step.copy}</p>

              {"closing" in step && step.closing ? (
                <p className="space-story__closing">{step.closing}</p>
              ) : null}

              {"fragments" in step && step.fragments?.length ? (
                <div className="space-story__fragments">
                  {step.fragments.map((fragment) => (
                    <p
                      key={fragment}
                      className={`space-story__fragment${fragment === "Felt." ? " space-story__fragment--felt" : ""}`}
                    >
                      {fragment}
                    </p>
                  ))}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
