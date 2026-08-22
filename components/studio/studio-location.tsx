import Link from "next/link";

import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioLocationProps = {
  location: StudioPageContent["location"];
};

export function StudioLocation({ location }: StudioLocationProps) {
  return (
    <section className="studio-location page-frame" aria-labelledby="studio-location-title">
      <p className="studio-eyebrow">{location.eyebrow}</p>
      <h2 id="studio-location-title" className="studio-location__name display">
        {location.name}
      </h2>
      <address className="studio-location__address">
        {location.lines.map((line) => (
          <span key={line} className="studio-location__line">
            {line}
          </span>
        ))}
      </address>
      <Link href="/contact" className="studio-location__visit">
        {location.visitLabel}
      </Link>
    </section>
  );
}
