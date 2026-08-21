import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-dvh flex-col">
      <SiteHeader />
      <section className="page-frame flex flex-1 flex-col justify-center py-fluid-xl">
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">404</p>
        <h1 className="display mt-3 text-display-lg">This page has moved on</h1>
        <p className="measure mt-6 text-muted">
          The page you asked for is not here. It may have been renamed, or the link may be from an
          older version of the site.
        </p>
        <nav aria-label="Recovery" className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase"
          >
            Homepage
          </Link>
          <Link
            href="/work"
            className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase transition-colors duration-[var(--duration-micro)] hover:border-accent hover:text-accent"
          >
            Browse work
          </Link>
        </nav>
      </section>
      <SiteFooter />
    </main>
  );
}
