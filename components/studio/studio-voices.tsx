"use client";

import Image from "next/image";
import { useCallback, useState } from "react";

import type { StudioPageContent, Testimonial } from "@/content/static";

import "@/styles/studio-page.css";

type StudioVoicesProps = {
  voices: StudioPageContent["voices"];
  items: Testimonial[];
};

function formatIndex(index: number, total: number): string {
  return `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export function StudioVoices({ voices, items }: StudioVoicesProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = items.length;
  const active = items[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (total === 0) return;
      setActiveIndex((index + total) % total);
    },
    [total],
  );

  if (!active || total === 0) {
    return null;
  }

  return (
    <section className="studio-voices" aria-labelledby="studio-voices-title">
      <header className="studio-voices__intro page-frame">
        <p className="studio-eyebrow">{voices.eyebrow}</p>
        <h2 id="studio-voices-title" className="studio-voices__headline display">
          {voices.headline}
        </h2>
        <p className="studio-voices__support">{voices.support}</p>
      </header>

      <div className="studio-voices__stage">
        <div className="studio-voices__backdrop" aria-hidden="true">
          <Image
            key={active.image}
            src={active.image}
            alt=""
            fill
            className="studio-voices__backdrop-image"
            sizes="100vw"
          />
          <span className="studio-voices__backdrop-scrim" />
        </div>

        <div className="studio-voices__panel page-frame">
          <p className="studio-voices__index" aria-live="polite">
            {formatIndex(activeIndex, total)}
          </p>

          <figure className="studio-voices__quote-wrap">
            <blockquote className="studio-voices__quote">
              <p>&ldquo;{active.quote}&rdquo;</p>
            </blockquote>
            <figcaption className="studio-voices__attribution">
              <cite className="studio-voices__name">{active.name}</cite>
              <span className="studio-voices__meta">
                {active.role} · {active.location}
              </span>
            </figcaption>
          </figure>

          <nav className="studio-voices__nav" aria-label="Testimonial navigation">
            <ol className="studio-voices__nav-list">
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={`${item.name}-${item.role}`}>
                    <button
                      type="button"
                      className="studio-voices__nav-button"
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`${item.name}, testimonial ${index + 1} of ${total}`}
                      onClick={() => goTo(index)}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    </section>
  );
}
