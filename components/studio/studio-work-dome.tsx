"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import type { StaticProject } from "@/content/static";
import { getStudioDomeGalleryItems } from "@/features/studio/dome-gallery-items";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import { StudioWorkGrid } from "@/components/studio/work-grid";

import "@/styles/dome-gallery.css";

const DomeGallery = dynamic(
  () => import("@/components/motion/dome-gallery").then((mod) => mod.DomeGallery),
  { ssr: false, loading: () => <div className="studio-work-dome" aria-hidden="true" /> },
);

type StudioWorkDomeProps = {
  projects: StaticProject[];
};

function useDomeRadius(): { minRadius: number; fit: number } {
  const [config, setConfig] = useState({ minRadius: 480, fit: 0.48 });

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      if (width < 480) {
        setConfig({ minRadius: 320, fit: 0.42 });
      } else if (width < 768) {
        setConfig({ minRadius: 400, fit: 0.45 });
      } else if (width < 1200) {
        setConfig({ minRadius: 480, fit: 0.48 });
      } else {
        setConfig({ minRadius: 560, fit: 0.5 });
      }
    };

    sync();
    window.addEventListener("resize", sync, { passive: true });
    return () => window.removeEventListener("resize", sync);
  }, []);

  return config;
}

export function StudioWorkDome({ projects }: StudioWorkDomeProps) {
  const reduced = useReducedMotion();
  const { minRadius, fit } = useDomeRadius();
  const items = getStudioDomeGalleryItems(projects);

  if (reduced) {
    return <StudioWorkGrid projects={projects} />;
  }

  return (
    <div className="studio-work-dome">
      <DomeGallery
        images={items}
        fit={fit}
        minRadius={minRadius}
        maxRadius={720}
        padFactor={0.2}
        overlayBlurColor="#0a0a0a"
        dragSensitivity={22}
        dragDampening={2.2}
        grayscale
        imageBorderRadius="10px"
        openedImageBorderRadius="10px"
        openedImageWidth="min(420px, 92vw)"
        openedImageHeight="auto"
      />
      <p className="studio-work-dome__hint">Drag to explore · Tap to view</p>
    </div>
  );
}
