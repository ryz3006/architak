import type { Metadata } from "next";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getStaticSite } from "@/content/static";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ARCHITAK in Vyttila, Kochi — phone, email, and project enquiry.",
};

export default function ContactPage() {
  const { studio } = getStaticSite();
  const wa = studio.phone.replace(/\D/g, "");

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader />
      <section className="px-6 py-16 md:px-12 md:py-24">
        <p className="text-xs tracking-[0.3em] text-muted uppercase">Contact</p>
        <h1 className="font-display mt-3 text-4xl md:text-6xl">Get in touch</h1>
        <p className="mt-6 max-w-xl text-muted">
          A passionate group of creative minds dedicated to transforming spaces with innovation and
          style.
        </p>

        <address className="mt-12 not-italic">
          <p className="text-lg">
            <a href={`tel:${studio.phone.replace(/\s/g, "")}`} className="hover:text-accent">
              {studio.phone}
            </a>
          </p>
          <p className="mt-2 text-lg">
            <a href={`mailto:${studio.email}`} className="hover:text-accent">
              {studio.email}
            </a>
          </p>
          <p className="mt-4 text-muted">{studio.address}</p>
        </address>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={`https://wa.me/${wa}`}
            className="border border-foreground bg-foreground px-6 py-3 text-sm tracking-widest text-background uppercase"
            rel="noopener noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:${studio.email}?subject=Project%20enquiry`}
            className="border border-border px-6 py-3 text-sm tracking-widest uppercase hover:border-accent"
          >
            Email enquiry
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
