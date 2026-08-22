"use client";

import { useEffect, useRef } from "react";

import { DriftWall, type DriftWallItem } from "@/components/motion/drift-wall";
import type { SpaceStory } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/space-story.css";

type SpaceStoryProps = {
  story: SpaceStory;
  images: DriftWallItem[];
};

export function SpaceStorySection({ story, images }: SpaceStoryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();

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
        <DriftWall items={images} />
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
