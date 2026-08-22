"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { StaticProject } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/studio-page.css";
import "@/styles/project-page.css";

type ProjectHeroProps = {
  project: StaticProject;
};

export function ProjectHero({ project }: ProjectHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled || !rootRef.current) return;

      const eyebrow = rootRef.current.querySelector(".project-hero__eyebrow");
      const title = rootRef.current.querySelector(".project-hero__title");

      ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (eyebrow) tl.fromTo(eyebrow, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 });
        if (title) tl.fromTo(title, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 }, "-=0.35");
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [reduced]);

  const coverAlt = `${project.title} — ${project.category} interior, ${project.location}`;

  return (
    <header ref={rootRef} className="project-hero studio-hero studio-section studio-section--hero">
      <div className="studio-hero__media">
        <Image
          src={project.coverImage}
          alt={coverAlt}
          fill
          priority
          className="studio-hero__image"
          sizes="100vw"
        />
        <span className="studio-hero__scrim" />
      </div>

      <div className="studio-hero__content page-frame">
        <div className="project-hero__content">
          <p className="studio-eyebrow project-hero__eyebrow">
            {project.category} · {project.location}
          </p>
          <h1 className="project-hero__title display">{project.title}</h1>
        </div>
      </div>
    </header>
  );
}
