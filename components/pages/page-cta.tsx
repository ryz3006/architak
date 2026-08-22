import Link from "next/link";

import { EnquireButton } from "@/components/layout/enquire-button";

import "@/styles/page-cta.css";

type PageCtaProps = {
  headline: string;
  support?: string;
};

export function PageCta({ headline, support }: PageCtaProps) {
  return (
    <section className="page-cta" aria-labelledby="page-cta-heading">
      <div className="page-cta__inner page-frame">
        <h2 id="page-cta-heading" className="page-cta__headline display">
          {headline}
        </h2>
        {support ? <p className="page-cta__support">{support}</p> : null}
        <div className="page-cta__actions">
          <EnquireButton />
          <Link href="/contact" className="page-cta__link">
            Contact details
          </Link>
        </div>
      </div>
    </section>
  );
}
