"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_KEY = "architak_vid";

function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v_${Date.now().toString(36)}`;
  }
}

function shouldTrack(pathname: string): boolean {
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/dev")) return false;
  return true;
}

/**
 * Fires a single privacy-light page-view beacon per client navigation.
 * Skips admin and known non-content routes. Failures are silent.
 */
export function TrafficBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !shouldTrack(pathname)) return;
    if (typeof navigator !== "undefined" && navigator.webdriver) return;

    const payload = JSON.stringify({
      path: pathname,
      visitorId: getVisitorId(),
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 500) : "",
    });

    const url = "/api/analytics/collect";
    try {
      if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(url, blob);
        return;
      }
    } catch {
      // fall through to fetch
    }

    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
