import Image from "next/image";

import "@/styles/page-hero.css";

type PageHeroProps = {
  eyebrow: string;
  headline: string;
  support?: string;
  image: string;
  imageAlt: string;
};

export function PageHero({ eyebrow, headline, support, image, imageAlt }: PageHeroProps) {
  return (
    <header className="page-hero">
      <div className="page-hero__media" aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          priority
          className="page-hero__image"
          sizes="100vw"
        />
        <span className="page-hero__scrim" />
      </div>

      <div className="page-hero__content page-frame">
        <p className="page-hero__eyebrow">{eyebrow}</p>
        <h1 className="page-hero__headline display">{headline}</h1>
        {support ? <p className="page-hero__support">{support}</p> : null}
      </div>
    </header>
  );
}
