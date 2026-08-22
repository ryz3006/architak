import Link from "next/link";

import { EnquireButton } from "@/components/layout/enquire-button";

import "@/styles/page-cta.css";

type PageCtaProps = {
  eyebrow?: string;
  headline: string;
  support?: string;
  showContactLink?: boolean;
};

export function PageCta({ eyebrow, headline, support, showContactLink = true }: PageCtaProps) {
  return (
    <section className="page-cta" aria-labelledby="page-cta-heading">
      <div className="page-cta__inner page-frame">
        {eyebrow ? <p className="page-cta__eyebrow">{eyebrow}</p> : null}
        <h2 id="page-cta-heading" className="page-cta__headline display">
          {headline}
        </h2>
        {support ? <p className="page-cta__support">{support}</p> : null}
        <div className="page-cta__actions">
          <EnquireButton />
          {showContactLink ? (
            <Link href="/contact" className="page-cta__link">
              Contact details
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
