"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { seriesColor } from "@/components/admin/charts/palette";
import { ChartTooltip } from "@/components/admin/charts/chart-tooltip";

export type DonutDatum = { label: string; value: number };

/**
 * Donut for status/composition breakdowns (e.g. projects by status).
 */
export function DonutChart({
  data,
  height = 220,
  ariaLabel,
}: {
  data: DonutDatum[];
  height?: number;
  ariaLabel?: string;
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
      <div
        role="img"
        aria-label={ariaLabel ?? "Composition"}
        className="shrink-0"
        style={{ width: 160, height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={54}
              outerRadius={78}
              paddingAngle={2}
              stroke="var(--color-background)"
              strokeWidth={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={seriesColor(index)} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip active={active} payload={payload as never} />
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex flex-col gap-2">
        {data.map((entry, index) => (
          <li key={entry.label} className="flex items-center gap-2 text-fluid-sm">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 rounded-full"
              style={{ background: seriesColor(index) }}
            />
            <span className="text-foreground">{entry.label}</span>
            <span className="text-muted">
              {entry.value}
              {total > 0 ? ` (${Math.round((entry.value / total) * 100)}%)` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
