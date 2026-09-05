"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { AdminShortcuts } from "@/components/admin/shortcuts";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/media", label: "Gallery" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/website-management", label: "Website" },
  { href: "/admin/seo", label: "SEO" },
  { href: "/admin/system-health", label: "System Health" },
  { href: "/admin/ops", label: "Operations" },
  { href: "/admin/settings", label: "Settings" },
] as const;

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={cn(
                "block min-h-11 border border-transparent px-3 py-2.5 text-fluid-sm tracking-widest uppercase",
                active
                  ? "border-border bg-surface text-foreground"
                  : "text-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-background text-foreground lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <AdminShortcuts />

      {/* Mobile top bar */}
      <header className="sticky top-0 z-[var(--z-header)] flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-3 lg:hidden">
        <div>
          <p className="text-fluid-xs tracking-[0.3em] text-muted uppercase">ARCHITAK Admin</p>
          <p className="mt-0.5 text-fluid-xs text-muted">{username}</p>
        </div>
        <button
          type="button"
          className="min-h-11 min-w-11 border border-border px-3 text-fluid-xs tracking-widest uppercase"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {/* Mobile slide-out */}
      {menuOpen ? (
        <div
          className="fixed inset-0 z-[var(--z-overlay)] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
        >
          <button
            type="button"
            className="absolute inset-0 bg-background/80"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id={menuId}
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-border bg-surface"
          >
            <div className="px-5 py-5">
              <p className="text-fluid-xs tracking-[0.3em] text-muted uppercase">Navigate</p>
            </div>
            <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-6">
              <NavLinks pathname={pathname} onNavigate={() => setMenuOpen(false)} />
              <form action={logoutAction} className="mt-8 px-3">
                <button
                  type="submit"
                  className="min-h-11 text-fluid-xs tracking-widest text-muted uppercase hover:text-foreground"
                >
                  Sign out
                </button>
              </form>
            </nav>
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border lg:block">
        <div className="px-5 py-5">
          <p className="text-fluid-xs tracking-[0.3em] text-muted uppercase">ARCHITAK Admin</p>
          <p className="mt-2 text-fluid-sm text-muted">Signed in as {username}</p>
        </div>
        <nav aria-label="Admin" className="px-3 pb-6">
          <NavLinks pathname={pathname} />
          <form action={logoutAction} className="mt-8 px-3">
            <button
              type="submit"
              className="text-fluid-xs tracking-widest text-muted uppercase hover:text-foreground"
            >
              Sign out
            </button>
          </form>
          <p className="mt-6 px-3 text-fluid-xs text-muted">
            Press <kbd>?</kbd> for keyboard shortcuts.
          </p>
        </nav>
      </aside>

      <div className="min-w-0">
        <div className="page-frame py-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
