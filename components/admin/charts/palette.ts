/**
 * Chart palette. Values reference the CSS variables declared in
 * `styles/admin.css` so charts follow theme + contrast preferences.
 * Recharts needs concrete color strings, so we read the variables at render
 * time via `var(...)` where the SVG allows, and fall back to these constants
 * for props (like `fill`) that must be literal.
 */
export const CHART_SERIES = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

export const CHART_GRID = "var(--chart-grid)";
export const CHART_AXIS = "var(--color-muted)";
export const CHART_ACCENT = "var(--color-accent)";

export function seriesColor(index: number): string {
  return CHART_SERIES[index % CHART_SERIES.length]!;
}
