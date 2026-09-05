"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { logoutAction } from "@/features/auth/actions";

/**
 * Signs the admin out after a period of inactivity. Any interaction resets the
 * timer; a warning is shown shortly before logout. Complements the server-side
 * sliding idle expiry so an idle tab does not stay authenticated.
 */
export function IdleLogout({ timeoutMinutes = 30 }: { timeoutMinutes?: number }) {
  useEffect(() => {
    const timeoutMs = Math.max(2, timeoutMinutes) * 60_000;
    const warnMs = Math.max(timeoutMs - 60_000, Math.floor(timeoutMs * 0.9));
    let warnTimer = 0;
    let logoutTimer = 0;

    function reset() {
      window.clearTimeout(warnTimer);
      window.clearTimeout(logoutTimer);
      warnTimer = window.setTimeout(() => {
        toast.warning("You will be signed out soon due to inactivity.");
      }, warnMs);
      logoutTimer = window.setTimeout(() => {
        void logoutAction();
      }, timeoutMs);
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      window.clearTimeout(warnTimer);
      window.clearTimeout(logoutTimer);
    };
  }, [timeoutMinutes]);

  return null;
}
