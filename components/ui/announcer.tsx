"use client";

import { useEffect, useState } from "react";

/**
 * Politely announces asynchronous outcomes.
 *
 * A live region must exist in the DOM before its content changes, otherwise
 * assistive technology may not report the update. The region is therefore
 * always rendered and only its text changes.
 */
export function Announcer({ message }: { message: string }) {
  const [announced, setAnnounced] = useState("");

  useEffect(() => {
    // Clearing first guarantees repeated identical messages are re-announced.
    setAnnounced("");
    if (!message) return;
    const id = window.setTimeout(() => setAnnounced(message), 50);
    return () => window.clearTimeout(id);
  }, [message]);

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {announced}
    </p>
  );
}
