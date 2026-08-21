"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin route error", error.digest ?? error.message);
  }, [error]);

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="display text-display-sm">Admin error</h1>
      <p className="mt-4 text-muted">
        This admin screen failed to load. If it persists, check that the Supabase and storage
        configuration is present for this environment.
      </p>
      {error.digest ? (
        <p className="mt-4 text-fluid-sm text-muted">Reference: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="border border-border px-5 py-2 text-fluid-sm tracking-widest uppercase hover:border-accent"
        >
          Try again
        </button>
        <a
          href="/admin"
          className="border border-border px-5 py-2 text-fluid-sm tracking-widest uppercase hover:border-accent"
        >
          Dashboard
        </a>
      </div>
    </main>
  );
}
