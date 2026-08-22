"use client";

import { useEffect, useRef } from "react";

import type { StudioPageContent } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-page.css";

type StudioManifestoProps = {
  manifesto: StudioPageContent["manifesto"];
};

export function StudioManifesto({ manifesto }: StudioManifestoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([gsapMod, stMod]) => {
      if (cancelled || !sectionRef.current) return;

      const gsap = gsapMod.default;
      const { ScrollTrigger } = stMod;
      gsap.registerPlugin(ScrollTrigger);

      const lines = sectionRef.current.querySelectorAll(".studio-manifesto__line");
      const statement = sectionRef.current.querySelector(".studio-manifesto__statement");
      const closing = sectionRef.current.querySelector(".studio-manifesto__closing");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 78%",
            once: true,
          },
          defaults: { ease: "power2.out" },
        });

        if (statement) {
          tl.fromTo(statement, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 1 });
        }
        tl.fromTo(
          lines,
          { autoAlpha: 0, x: 32 },
          { autoAlpha: 1, x: 0, duration: 0.75, stagger: 0.1 },
          "-=0.5",
        );
        if (closing) {
          tl.fromTo(closing, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.2");
        }
      }, section);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [manifesto.lines.length, reduced]);

  return (
    <section
      ref={sectionRef}
      className="studio-manifesto studio-section studio-section--manifesto page-frame"
      aria-labelledby="studio-manifesto-title"
    >
      <p className="studio-eyebrow studio-manifesto__eyebrow">{manifesto.eyebrow}</p>
      <h2 id="studio-manifesto-title" className="studio-manifesto__statement display">
        {manifesto.statement}
      </h2>
      <div className="studio-manifesto__body">
        <div className="studio-manifesto__lines">
          {manifesto.lines.map((line) => (
            <p key={line} className="studio-manifesto__line">
              {line}
            </p>
          ))}
        </div>
        <p className="studio-manifesto__closing display">{manifesto.closing}</p>
      </div>
    </section>
  );
}
