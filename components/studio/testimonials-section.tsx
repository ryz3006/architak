import type { Testimonial } from "@/content/static";

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

      <ul className="testimonials__list">
        {items.map((item) => (
          <li key={`${item.name}-${item.role}`} className="testimonials__item">
            <blockquote className="testimonials__quote">
              <p>&ldquo;{item.quote}&rdquo;</p>
              <footer className="testimonials__attribution">
                <cite className="testimonials__name">{item.name}</cite>
                <span className="testimonials__role">
                  {item.role} · {item.location}
                </span>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </section>
  );
}
