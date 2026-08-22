import Link from "next/link";

import { BrandLockup } from "@/components/layout/brand-lockup";
import { MobileNav, type NavLink } from "@/components/layout/mobile-nav";
import { getStaticSite } from "@/content/static";

import "@/styles/site-brand.css";

const links: readonly NavLink[] = [
  { href: "/work", label: "Work" },
  { href: "/studio", label: "Studio" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ homeHero = false }: { homeHero?: boolean }) {
  const tagline = getStaticSite().studio.tagline;

  return (
    <header
      className={`page-frame relative z-[var(--z-header)] flex items-start justify-between py-6${homeHero ? " site-header--home" : ""}`}
      style={{ paddingTop: "calc(var(--safe-top) + 1.5rem)" }}
    >
      <Link href="/" className="site-brand" aria-label="ARCHITAK home">
        <BrandLockup tagline={tagline} logoPriority />
      </Link>

      <nav aria-label="Primary" className="hidden gap-8 text-fluid-sm tracking-widest uppercase md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted transition-colors duration-[var(--duration-micro)] hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <MobileNav links={links} />
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className="page-frame mt-auto border-t border-border py-10"
      style={{ paddingBottom: "calc(var(--safe-bottom) + 2.5rem)" }}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display text-fluid-xl tracking-[0.15em]">ARCHITAK</p>
          <p className="mt-2 text-fluid-sm text-muted">CREATED TO CREATE · Vyttila, Kochi</p>
        </div>
        <p className="text-fluid-sm text-muted">
          <a href="tel:+918891991999" className="hover:text-foreground">
            +91 88919 91999
          </a>
          {" · "}
          <a href="mailto:architak336@gmail.com" className="hover:text-foreground">
            architak336@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
}
