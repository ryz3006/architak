"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type NavLink = {
  href: string;
  label: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Full-screen navigation for compact viewports.
 *
 * The panel is a modal surface: focus moves in on open, is trapped while open,
 * and returns to the toggle on close. Background scroll is locked so the page
 * behind cannot be dragged on touch devices.
 */
export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  // A route change means the user has navigated; the panel must not persist.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    // Move focus into the panel so the next Tab stays inside it.
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab" || !panel) return;

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      // Restore focus to the control that opened the panel.
      (toggleRef.current ?? previouslyFocused)?.focus();
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((value) => !value)}
        className="relative z-[calc(var(--z-overlay)+1)] inline-flex h-11 w-11 flex-col items-center justify-center gap-[5px] border border-border"
      >
        <span
          aria-hidden="true"
          className="block h-px w-5 bg-foreground transition-transform duration-[var(--duration-small)] ease-[var(--ease-standard)]"
          style={open ? { transform: "translateY(3px) rotate(45deg)" } : undefined}
        />
        <span
          aria-hidden="true"
          className="block h-px w-5 bg-foreground transition-transform duration-[var(--duration-small)] ease-[var(--ease-standard)]"
          style={open ? { transform: "translateY(-3px) rotate(-45deg)" } : undefined}
        />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col overflow-y-auto bg-background"
          style={{
            paddingTop: "calc(var(--safe-top) + 6rem)",
            paddingBottom: "calc(var(--safe-bottom) + 2rem)",
            paddingLeft: "max(var(--gutter), var(--safe-left))",
            paddingRight: "max(var(--gutter), var(--safe-right))",
          }}
        >
          <nav aria-label="Primary">
            <ul className="flex flex-col gap-2">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={active ? "page" : undefined}
                      className="display block border-b border-border py-4 text-display-sm text-foreground aria-[current=page]:text-accent"
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto pt-10 text-fluid-sm text-muted">
            <a href="tel:+918891991999" className="block hover:text-foreground">
              +91 88919 91999
            </a>
            <a href="mailto:architak336@gmail.com" className="mt-1 block hover:text-foreground">
              architak336@gmail.com
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
