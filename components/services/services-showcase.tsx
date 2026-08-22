import Image from "next/image";

import type { StaticService } from "@/content/static";

import "@/styles/services-showcase.css";

type ServicesShowcaseProps = {
  services: StaticService[];
};

export function ServicesShowcase({ services }: ServicesShowcaseProps) {
  return (
    <ul className="services-showcase">
      {services.map((service, index) => (
        <li
          key={service.slug}
          className="services-showcase__item"
          data-reverse={index % 2 === 1 ? "true" : undefined}
        >
          <div className="services-showcase__media">
            <Image
              src={service.image}
              alt=""
              fill
              className="services-showcase__image"
              sizes="(max-width: 48rem) 100vw, 50vw"
            />
            <span className="services-showcase__scrim" aria-hidden="true" />
          </div>

          <div className="services-showcase__copy">
            <p className="services-showcase__index">{String(index + 1).padStart(2, "0")}</p>
            <h2 className="services-showcase__title display">{service.title}</h2>
            <p className="services-showcase__lead">{service.description}</p>
            <p className="services-showcase__detail">{service.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
