import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "/work", label: "Work" },
  { href: "/studio", label: "Studio" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" className="inline-flex items-center gap-3" aria-label="ARCHITAK home">
        <Image
          src="/brand/logo-no-bg.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          priority
        />
        <span className="font-display text-xl tracking-[0.2em]">ARCHITAK</span>
      </Link>
      <nav aria-label="Primary" className="hidden gap-8 text-sm tracking-widest uppercase md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border px-6 py-10 md:px-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-2xl tracking-[0.15em]">ARCHITAK</p>
          <p className="mt-2 text-sm text-muted">CREATED TO CREATE · Vyttila, Kochi</p>
        </div>
        <p className="text-sm text-muted">
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
