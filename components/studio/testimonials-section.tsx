import type { Testimonial } from "@/content/static";

import { TestimonialsChroma } from "@/components/studio/testimonials-chroma";

import "@/styles/testimonials.css";

type TestimonialsSectionProps = {
  heading: string;
  support: string;
  items: Testimonial[];
};

export function TestimonialsSection({ heading, support, items }: TestimonialsSectionProps) {
  return (
    <section className="testimonials" aria-labelledby="testimonials-heading">
      <header className="testimonials__intro">
        <h2 id="testimonials-heading" className="testimonials__heading display">
          {heading}
        </h2>
        <p className="testimonials__support">{support}</p>
      </header>

      <TestimonialsChroma items={items} />

      <ul className="testimonials__sr-list" aria-label="Client testimonials">
        {items.map((item) => (
          <li key={`${item.name}-${item.role}`}>
            <blockquote>
              <p>&ldquo;{item.quote}&rdquo;</p>
              <footer>
                {item.name}, {item.role}, {item.location}
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>

      <noscript>
        <ul className="testimonials__fallback">
          {items.map((item) => (
            <li key={`${item.name}-${item.role}`}>
              <blockquote>
                <p>&ldquo;{item.quote}&rdquo;</p>
                <footer>
                  <cite>{item.name}</cite>
                  <span>
                    {item.role} · {item.location}
                  </span>
                </footer>
              </blockquote>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
