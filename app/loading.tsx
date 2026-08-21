/**
 * Route-level loading state. Announced politely rather than trapping focus, and
 * deliberately typographic instead of a spinner over the whole page.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="page-frame flex min-h-dvh flex-col justify-center py-fluid-xl"
    >
      <p className="display text-display-sm text-muted">Loading</p>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
