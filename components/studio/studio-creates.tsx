"use client";

import { useEffect, useRef } from "react";

import type { StudioPageContent } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-page.css";

type StudioCreatesProps = {
  creates: StudioPageContent["creates"];
};

export function StudioCreates({ creates }: StudioCreatesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const pillarRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) {
      pillarRefs.current.forEach((pillar) => pillar?.setAttribute("data-state", "active"));
      return;
    }

    const pillars = pillarRefs.current.filter(Boolean) as HTMLLIElement[];
    if (pillars.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLLIElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
            target.dataset.state = "active";
          } else if (entry.boundingClientRect.top < 0) {
            target.dataset.state = "past";
          } else {
            target.dataset.state = "future";
          }
        });
      },
      {
        threshold: [0.2, 0.35, 0.6],
        rootMargin: "-10% 0px -20% 0px",
      },
    );

    pillars.forEach((pillar) => observer.observe(pillar));
    pillars[0]?.setAttribute("data-state", "active");

    return () => observer.disconnect();
  }, [creates.pillars.length, reduced]);

  return (
    <section ref={sectionRef} className="studio-creates page-frame" aria-labelledby="studio-creates-title">
      <p className="studio-eyebrow">{creates.eyebrow}</p>
      <h2 id="studio-creates-title" className="studio-creates__intro display">
        We create
      </h2>

      <ol className="studio-creates__pillars">
        {creates.pillars.map((pillar, index) => (
          <li
            key={pillar.title}
            ref={(element) => {
              pillarRefs.current[index] = element;
            }}
            className="studio-creates__pillar"
            data-state={index === 0 ? "active" : "future"}
          >
            <h3 className="studio-creates__pillar-title display">{pillar.title}.</h3>
            <p className="studio-creates__pillar-tagline">{pillar.tagline}</p>
            <p className="studio-creates__pillar-progression">
              <span className="studio-creates__pillar-name">{pillar.title}</span> {pillar.progression}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
