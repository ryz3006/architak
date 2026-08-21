"use client";

import { useEffect, useState } from "react";

type Offender = {
  tag: string;
  className: string;
  overflowPx: number;
};

/**
 * Development-only horizontal overflow detector.
 *
 * The Playwright matrix asserts the same invariant in CI, but during hand
 * layout work it is far quicker to see the offending element named on screen
 * than to run the suite.
 */
export function OverflowGuard() {
  const [offenders, setOffenders] = useState<Offender[]>([]);

  useEffect(() => {
    function scan() {
      const limit = document.documentElement.clientWidth;
      const found: Offender[] = [];

      for (const element of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
        if (element.closest("[data-overflow-guard]")) continue;
        const rect = element.getBoundingClientRect();
        // One pixel of tolerance absorbs fractional layout rounding.
        if (rect.width > 0 && rect.right > limit + 1) {
          found.push({
            tag: element.tagName.toLowerCase(),
            className: String(element.className || "").split(" ").slice(0, 3).join(" "),
            overflowPx: Math.round(rect.right - limit),
          });
        }
      }

      setOffenders(found.slice(0, 8));
    }

    scan();

    const observer = new ResizeObserver(scan);
    observer.observe(document.body);
    window.addEventListener("resize", scan);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", scan);
    };
  }, []);

  if (offenders.length === 0) return null;

  return (
    <aside
      data-overflow-guard
      aria-live="polite"
      className="fixed inset-x-2 bottom-2 z-[var(--z-modal)] border border-accent bg-surface p-3 text-fluid-xs"
    >
      <p className="tracking-widest text-accent uppercase">
        Horizontal overflow — {offenders.length} element(s)
      </p>
      <ul className="mt-2 flex flex-col gap-1 text-muted">
        {offenders.map((offender, index) => (
          <li key={`${offender.tag}-${index}`}>
            {offender.tag}
            {offender.className ? `.${offender.className.replaceAll(" ", ".")}` : ""} — +
            {offender.overflowPx}px
          </li>
        ))}
      </ul>
    </aside>
  );
}
