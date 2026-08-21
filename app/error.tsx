"use client";

import { useEffect } from "react";

/**
 * Root error boundary. Keeps ARCHITAK typography so a failure never exposes an
 * unstyled browser default, and always offers a way forward.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest correlates with the server log without leaking internals.
    console.error("Unhandled route error", error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-dvh flex-col justify-center">
      <div className="page-frame py-fluid-xl">
        <p className="text-fluid-sm tracking-[0.3em] text-muted uppercase">Error</p>
        <h1 className="display mt-3 text-display-lg">Something went wrong</h1>
        <p className="measure mt-6 text-muted">
          This page failed to load. Trying again often resolves it. If it keeps happening, reach the
          studio on{" "}
          <a href="tel:+918891991999" className="text-foreground underline">
            +91 88919 91999
          </a>
          .
        </p>
        {error.digest ? (
          <p className="mt-4 text-fluid-sm text-muted">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-10 flex flex-wrap gap-4">
          <button
            type="button"
            onClick={reset}
            className="border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-border px-6 py-3 text-fluid-sm tracking-widest uppercase transition-colors duration-[var(--duration-micro)] hover:border-accent hover:text-accent"
          >
            Homepage
          </a>
        </div>
      </div>
    </main>
  );
}
