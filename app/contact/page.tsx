import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticSite } from "@/content/static";
import { absoluteUrl } from "@/features/discovery";
import { EnquiryForm } from "@/features/enquiries/enquiry-form";
import {
  buildBreadcrumbJsonLd,
  jsonLdScript,
} from "@/features/discovery/structured-data";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ARCHITAK in Vyttila, Kochi — phone, email, WhatsApp, and project enquiry.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  const { studio } = getStaticSite();
  const wa = studio.phone.replace(/\D/g, "");

  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          buildBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        )}
      />
      <SiteHeader />
      <section className="page-frame grid gap-fluid-lg py-fluid-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Contact</p>
          <h1 className="display mt-3 text-display-lg">Begin here</h1>
          <p className="measure mt-6 text-muted">
            Tell us how you live. We will shape the space around it.
          </p>

          <address className="mt-12 not-italic">
            <p className="text-fluid-lg">
              <a href={`tel:${studio.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                {studio.phone}
              </a>
            </p>
            <p className="mt-2 text-fluid-lg">
              <a href={`mailto:${studio.email}`} className="hover:text-accent">
                {studio.email}
              </a>
            </p>
            <p className="mt-4 text-muted">{studio.address}</p>
          </address>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href={`https://wa.me/${wa}`}
              className="border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase"
              rel="noopener noreferrer"
              target="_blank"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${studio.email}?subject=Project%20enquiry`}
              className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase hover:border-accent"
            >
              Email enquiry
            </a>
          </div>
        </div>

        <div className="border border-border bg-surface p-6 md:p-8">
          <h2 className="display text-display-sm">Project enquiry</h2>
          <p className="mt-3 text-fluid-sm text-muted">A short brief is enough.</p>
          <div className="mt-8">
            <EnquiryForm />
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
