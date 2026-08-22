import Image from "next/image";

import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioHeroProps = {
  hero: StudioPageContent["hero"];
};

export function StudioHero({ hero }: StudioHeroProps) {
  return (
    <header className="studio-hero">
      <div className="studio-hero__media" aria-hidden="true">
        <Image
          src={hero.image}
          alt=""
          fill
          priority
          className="studio-hero__image"
          sizes="100vw"
        />
        <span className="studio-hero__scrim" />
      </div>

      <div className="studio-hero__content page-frame">
        <p className="studio-eyebrow">{hero.eyebrow}</p>
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
        <p className="studio-hero__support">{hero.support}</p>
      </div>
    </header>
  );
}
