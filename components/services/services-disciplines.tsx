"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import type { StaticService } from "@/content/static";
import { useReducedMotion } from "@/lib/a11y/use-reduced-motion";

import "@/styles/services-page.css";

type ServicesDisciplinesProps = {
  services: StaticService[];
};

export function ServicesDisciplines({ services }: ServicesDisciplinesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reduced) {
      itemRefs.current.forEach((item) => item?.setAttribute("data-state", "active"));
      return;
    }

    const items = itemRefs.current.filter(Boolean) as HTMLLIElement[];
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLLIElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            target.dataset.state = "active";
          } else if (entry.boundingClientRect.top < 0) {
            target.dataset.state = "past";
          } else {
            target.dataset.state = "future";
          }
        });
      },
      {
        threshold: [0.15, 0.3, 0.55],
        rootMargin: "-8% 0px -18% 0px",
      },
    );

    items.forEach((item) => observer.observe(item));
    items[0]?.setAttribute("data-state", "active");

    return () => observer.disconnect();
  }, [services.length, reduced]);

  return (
    <section
      ref={sectionRef}
      className="services-disciplines studio-section studio-section--disciplines"
      aria-label="Practice disciplines"
    >
      <ol className="services-disciplines__list">
        {services.map((service, index) => (
          <li
            key={service.slug}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            className="services-disciplines__item page-frame"
            data-align={index % 2 === 0 ? "start" : "end"}
            data-state={index === 0 ? "active" : "future"}
          >
            <div className="services-disciplines__media">
              <Image
                src={service.image}
                alt={`${service.title} — ${service.description}`}
                fill
                className="services-disciplines__image"
                sizes="(max-width: 48rem) 100vw, 46vw"
              />
              <span className="services-disciplines__scrim" aria-hidden="true" />
            </div>

            <div className="services-disciplines__copy">
              <p className="services-disciplines__index">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="services-disciplines__title display">{service.title}</h3>
              <p className="services-disciplines__lead">{service.description}</p>
              <p className="services-disciplines__detail">{service.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
