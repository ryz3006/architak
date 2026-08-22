import type { StudioPageContent } from "@/content/static";

import "@/styles/studio-page.css";

type StudioLocationProps = {
  location: StudioPageContent["location"];
};

export function StudioLocation({ location }: StudioLocationProps) {
  return (
    <section className="studio-location studio-section studio-section--location page-frame" aria-labelledby="studio-location-title">
      <p className="studio-eyebrow">{location.eyebrow}</p>

      <div className="studio-location__grid">
        <div className="studio-location__details">
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
          <a
            href={location.mapUrl}
            className="studio-location__visit"
            target="_blank"
            rel="noopener noreferrer"
          >
            {location.visitLabel}
          </a>
        </div>

        <div className="studio-location__map-wrap">
          <iframe
            className="studio-location__map"
            src={location.mapEmbedUrl}
            title="ARCHITAK studio on Google Maps — Vyttila, Kochi"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
