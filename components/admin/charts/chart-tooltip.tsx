"use client";

import type { ReactNode } from "react";

/**
 * Shared tooltip surface for Recharts. Recharts passes an untyped payload,
 * so we accept a loose shape and render label + entries.
 */
type TooltipEntry = {
  name?: string | number;
  value?: string | number;
  color?: string;
};

export function ChartTooltip({
  active,
  label,
  payload,
  formatter,
}: {
  active?: boolean;
  label?: ReactNode;
  payload?: TooltipEntry[];
  formatter?: (value: number | string | undefined, name: string | number | undefined) => ReactNode;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] px-3 py-2 text-fluid-xs shadow-[var(--admin-shadow)]">
      {label != null ? <p className="mb-1 font-medium text-foreground">{label}</p> : null}
      <ul className="flex flex-col gap-1">
        {payload.map((entry, index) => (
          <li key={index} className="flex items-center gap-2 text-muted">
            <span
              aria-hidden="true"
              className="inline-block size-2 rounded-full"
              style={{ background: entry.color }}
            />
            <span className="text-foreground">
              {formatter ? formatter(entry.value, entry.name) : `${entry.name}: ${entry.value}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
