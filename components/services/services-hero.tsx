"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { EditorialHero } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-page.css";

type ServicesHeroProps = {
  hero: EditorialHero;
};

export function ServicesHero({ hero }: ServicesHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled || !rootRef.current) return;

      const lines = rootRef.current.querySelectorAll(".studio-hero__headline-line, .studio-hero__lead-line");
      const support = rootRef.current.querySelector(".studio-hero__support");
      const eyebrow = rootRef.current.querySelector(".studio-hero__eyebrow");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (eyebrow) tl.fromTo(eyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 });
        tl.fromTo(
          lines,
          { autoAlpha: 0, y: 40 },
          { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 },
          "-=0.35",
        );
        if (support) {
          tl.fromTo(support, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8 }, "-=0.45");
        }
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <header ref={rootRef} className="studio-hero studio-section studio-section--hero">
      <div className="studio-hero__media">
        <Image
          src={hero.image}
          alt={hero.imageAlt}
          fill
          priority
          className="studio-hero__image"
          sizes="100vw"
        />
        <span className="studio-hero__scrim" />
      </div>

      <div className="studio-hero__content page-frame">
        <div className="studio-hero__grid">
          <div className="studio-hero__primary">
            <p className="studio-eyebrow studio-hero__eyebrow">{hero.eyebrow}</p>
            <h1 className="studio-hero__headline display">
              {hero.headline.map((line) => (
                <span key={line} className="studio-hero__headline-line">
                  {line}
                </span>
              ))}
            </h1>
            <p className="studio-hero__lead display">
              {hero.lead.map((line) => (
                <span key={line} className="studio-hero__lead-line">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <p className="studio-hero__support">{hero.support}</p>
        </div>
      </div>
    </header>
  );
}
