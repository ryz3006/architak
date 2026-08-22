import { MorphingInfinity } from "@/components/loading-ui/morphing-infinity";

/**
 * Route-level loading state. Announced politely rather than trapping focus.
 */
export default function Loading() {
  return (
    <div
      aria-live="polite"
      className="page-frame flex min-h-dvh flex-col items-start justify-center gap-6 py-fluid-xl"
    >
      <MorphingInfinity className="size-12 text-accent md:size-14" />
      <p className="display text-fluid-sm tracking-[0.18em] text-muted uppercase">Loading</p>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
