import Link from "next/link";

import { EnquireButton } from "@/components/layout/enquire-button";
import { BrandLockup } from "@/components/layout/brand-lockup";
import { MobileNav, type NavLink } from "@/components/layout/mobile-nav";
import { SOCIAL_PLATFORMS } from "@/components/icons/social-icon";
import { getSocialProfiles, getStaticSite } from "@/content/static";

import "@/styles/site-footer.css";

const links: readonly NavLink[] = [
  { href: "/studio", label: "Studio" },
  { href: "/services", label: "Services" },
] as const;

const footerLinks: readonly NavLink[] = [
  ...links,
  { href: "/studio#work", label: "Work" },
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

      <div className="flex shrink-0 items-center gap-3 md:gap-8">
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

        <EnquireButton className="relative z-[calc(var(--z-header)+1)]" />
        <MobileNav links={links} />
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { studio } = getStaticSite();
  const social = getSocialProfiles();
  const phoneHref = `tel:${studio.phone.replace(/\s/g, "")}`;
  const year = new Date().getFullYear();

  const socialLinks = SOCIAL_PLATFORMS.map((entry) => ({
    ...entry,
    href: social[entry.key],
  })).filter((entry): entry is (typeof SOCIAL_PLATFORMS)[number] & { href: string } =>
    Boolean(entry.href),
  );

  return (
    <footer className="site-footer">
      <div className="site-footer__inner page-frame">
        <div className="site-footer__brand-block">
          <p className="site-footer__brand display">ARCHITAK</p>
          <p className="site-footer__tagline">{studio.tagline}</p>
          <p className="site-footer__location">{studio.location}</p>
        </div>

        <div className="site-footer__aside">
          <nav aria-label="Footer">
            <ul className="site-footer__nav-list">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="site-footer__nav-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {socialLinks.length > 0 ? (
            <nav aria-label="Social profiles">
              <ul className="site-footer__social-list">
                {socialLinks.map((entry) => (
                  <li key={entry.key}>
                    <a
                      href={entry.href}
                      className="site-footer__social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {entry.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <address className="site-footer__contact">
            <p className="site-footer__contact-line">
              <a href={phoneHref} className="site-footer__contact-link">
                {studio.phone}
              </a>
            </p>
            <p className="site-footer__contact-line">
              <a href={`mailto:${studio.email}`} className="site-footer__contact-link">
                {studio.email}
              </a>
            </p>
          </address>

          <p className="site-footer__fineprint">© {year} ARCHITAK</p>
        </div>
      </div>
    </footer>
  );
}
