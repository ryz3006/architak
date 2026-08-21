"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SHORTCUTS = [
  { keys: "g d", href: "/admin", label: "Dashboard" },
  { keys: "g p", href: "/admin/projects", label: "Projects" },
  { keys: "g m", href: "/admin/media", label: "Media" },
  { keys: "g l", href: "/admin/enquiries", label: "Leads" },
  { keys: "g s", href: "/admin/seo", label: "SEO" },
  { keys: "g o", href: "/admin/ops", label: "Operations" },
  { keys: "g ,", href: "/admin/settings", label: "Settings" },
] as const;

/**
 * Global keyboard shortcuts for the admin.
 *
 * `g` then a letter jumps between sections. `?` opens the cheat sheet.
 * Typing inside inputs never triggers navigation.
 */
export function AdminShortcuts() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pendingG, setPendingG] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;

      if (event.key === "?" || (event.shiftKey && event.key === "/")) {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
        setPendingG(false);
        return;
      }

      if (event.key === "g" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        setPendingG(true);
        window.clearTimeout(timer);
        timer = window.setTimeout(() => setPendingG(false), 1000);
        return;
      }

      if (pendingG) {
        const map: Record<string, string> = {
          d: "/admin",
          p: "/admin/projects",
          m: "/admin/media",
          l: "/admin/enquiries",
          s: "/admin/seo",
          o: "/admin/ops",
          ",": "/admin/settings",
        };
        const href = map[event.key];
        if (href) {
          event.preventDefault();
          router.push(href);
        }
        setPendingG(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [pendingG, router]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-background/80 p-6"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md border border-border bg-surface p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="display text-display-sm">Keyboard shortcuts</h2>
        <ul className="mt-6 flex flex-col gap-3">
          {SHORTCUTS.map((item) => (
            <li key={item.href} className="flex items-center justify-between gap-4 text-fluid-sm">
              <span>{item.label}</span>
              <kbd className="border border-border px-2 py-1 text-fluid-xs tracking-widest uppercase">
                {item.keys}
              </kbd>
            </li>
          ))}
          <li className="flex items-center justify-between gap-4 text-fluid-sm">
            <span>Show this panel</span>
            <kbd className="border border-border px-2 py-1 text-fluid-xs">?</kbd>
          </li>
        </ul>
        <p className="mt-6 text-fluid-xs text-muted">Press Escape to close.</p>
      </div>
    </div>
  );
}
