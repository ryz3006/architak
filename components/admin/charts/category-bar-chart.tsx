"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { CHART_AXIS, CHART_GRID, seriesColor } from "@/components/admin/charts/palette";
import { ChartTooltip } from "@/components/admin/charts/chart-tooltip";

export type CategoryDatum = { label: string; value: number };

/**
 * Horizontal category bars (e.g. projects by category, enquiry funnel).
 */
export function CategoryBarChart({
  data,
  height = 260,
  ariaLabel,
}: {
  data: CategoryDatum[];
  height?: number;
  ariaLabel?: string;
}) {
  return (
    <div role="img" aria-label={ariaLabel ?? "Category breakdown"} style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={120}
          />
          <Tooltip
            cursor={{ fill: "var(--admin-surface)" }}
            content={({ active, label, payload }) => (
              <ChartTooltip active={active} label={label} payload={payload as never} />
            )}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((_, index) => (
              <Cell key={index} fill={seriesColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
