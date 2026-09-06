"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type AdminLoadingContextValue = {
  /** True while a route transition or explicit loading lock is active. */
  loading: boolean;
  /** Set a named lock (e.g. "upload", "save"). Cleared when count hits 0. */
  start: (key?: string) => void;
  stop: (key?: string) => void;
  /** Run an async task under the overlay. */
  withLoading: <T>(task: () => Promise<T>, key?: string) => Promise<T>;
};

const AdminLoadingContext = createContext<AdminLoadingContextValue | null>(null);

/**
 * Global admin loading state: route changes + explicit action locks.
 * Overlays live in {@link AdminLoadingOverlay}.
 */
export function AdminLoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [routePending, startRouteTransition] = useTransition();
  const [locks, setLocks] = useState<string[]>([]);
  const [navigating, setNavigating] = useState(false);

  // Clear the soft "navigating" flag once the pathname has updated.
  useEffect(() => {
    // Pathname is an external Next.js navigation signal.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset soft nav lock after route settles
    setNavigating(false);
  }, [pathname]);

  // Catch in-app link clicks so the overlay appears before the RSC payload lands.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          return;
        }
        if (!url.pathname.startsWith("/admin")) return;
        setNavigating(true);
        startRouteTransition(() => {
          // Pathname update (via Next navigation) clears navigating in the effect above.
        });
      } catch {
        // Ignore malformed hrefs.
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [startRouteTransition]);

  const start = useCallback((key = "default") => {
    setLocks((prev) => [...prev, key]);
  }, []);

  const stop = useCallback((key = "default") => {
    setLocks((prev) => {
      const index = prev.lastIndexOf(key);
      if (index < 0) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, []);

  const withLoading = useCallback(
    async <T,>(task: () => Promise<T>, key = "default"): Promise<T> => {
      start(key);
      try {
        return await task();
      } finally {
        stop(key);
      }
    },
    [start, stop],
  );

  const loading = navigating || routePending || locks.length > 0;

  const value = useMemo(
    () => ({ loading, start, stop, withLoading }),
    [loading, start, stop, withLoading],
  );

  return <AdminLoadingContext.Provider value={value}>{children}</AdminLoadingContext.Provider>;
}

export function useAdminLoading(): AdminLoadingContextValue {
  const ctx = useContext(AdminLoadingContext);
  if (!ctx) {
    return {
      loading: false,
      start: () => undefined,
      stop: () => undefined,
      withLoading: async (task) => task(),
    };
  }
  return ctx;
}

/** Full-screen overlay shown while admin routes or actions are in flight. */
export function AdminLoadingOverlay() {
  const { loading } = useAdminLoading();

  return (
    <div
      className="admin-loading-overlay"
      data-visible={loading ? "true" : "false"}
      aria-hidden={!loading}
      role="status"
      aria-live="polite"
      aria-busy={loading}
    >
      <div className="admin-loading-overlay__panel">
        <span className="admin-loading-overlay__spinner" aria-hidden="true" />
        <span className="admin-loading-overlay__label">Loading…</span>
      </div>
    </div>
  );
}
