"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

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

type DomeLayout = {
  fit: number;
  minRadius: number;
  maxRadius: number;
  fitBasis: "auto" | "width" | "min";
  segments: number;
};

function resolveDomeLayout(width: number, height: number): DomeLayout {
  const minDim = Math.min(width, height);
  const aspect = width / Math.max(height, 1);

  if (width < 480) {
    return {
      fit: 0.68,
      minRadius: Math.round(minDim * 0.4),
      maxRadius: Number.POSITIVE_INFINITY,
      fitBasis: "width",
      segments: 30,
    };
  }

  if (width < 768) {
    return {
      fit: 0.82,
      minRadius: Math.round(width * 0.38),
      maxRadius: Number.POSITIVE_INFINITY,
      fitBasis: "width",
      segments: 32,
    };
  }

  if (width < 1200) {
    return {
      fit: aspect > 1.15 ? 1.02 : 0.94,
      minRadius: Math.round(width * 0.4),
      maxRadius: Number.POSITIVE_INFINITY,
      fitBasis: "width",
      segments: 35,
    };
  }

  return {
    fit: aspect > 1.35 ? 1.08 : 1.02,
    minRadius: Math.round(width * 0.42),
    maxRadius: Number.POSITIVE_INFINITY,
    fitBasis: "width",
    segments: 35,
  };
}

function useDomeLayout(containerRef: React.RefObject<HTMLDivElement | null>): DomeLayout {
  const [layout, setLayout] = useState<DomeLayout>({
    fit: 0.56,
    minRadius: 480,
    maxRadius: 1200,
    fitBasis: "width",
    segments: 35,
  });

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const sync = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      setLayout(resolveDomeLayout(rect.width, rect.height));
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    window.addEventListener("orientationchange", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", sync);
    };
  }, [containerRef]);

  return layout;
}

function useDomeInteractionHint(): { primary: string; secondary: string } {
  const [hint, setHint] = useState({
    primary: "Explore the spaces",
    secondary: "Drag to move through the work",
  });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    setHint(
      finePointer
        ? {
            primary: "Explore the spaces",
            secondary: "Drag to move through the work",
          }
        : {
            primary: "Swipe to explore",
            secondary: "Tap a space to enter",
          },
    );
  }, []);

  return hint;
}

export function StudioWorkDome({ projects }: StudioWorkDomeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const layout = useDomeLayout(containerRef);
  const hint = useDomeInteractionHint();
  const items = getStudioDomeGalleryItems(projects);

  if (reduced) {
    return (
      <div className="studio-work-section__dome studio-work-section__dome--grid page-frame">
        <StudioWorkGrid projects={projects} />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="studio-work-dome">
      <DomeGallery
        images={items}
        fit={layout.fit}
        fitBasis={layout.fitBasis}
        minRadius={layout.minRadius}
        maxRadius={layout.maxRadius}
        segments={layout.segments}
        padFactor={0.03}
        heightCapFactor={false}
        overlayBlurColor="#0a0a0a"
        dragSensitivity={22}
        dragDampening={2.2}
        grayscale
        imageBorderRadius="10px"
        openedImageBorderRadius="10px"
        openedImageWidth="min(420px, 92vw)"
        openedImageHeight="auto"
        className="sphere-root--studio-fill"
      />
      <div className="studio-work-dome__hint" aria-hidden="true">
        <p className="studio-work-dome__hint-primary">{hint.primary}</p>
        <p className="studio-work-dome__hint-secondary">{hint.secondary}</p>
      </div>
    </div>
  );
}
