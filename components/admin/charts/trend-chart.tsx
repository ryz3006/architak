"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_ACCENT, CHART_AXIS, CHART_GRID } from "@/components/admin/charts/palette";
import { ChartTooltip } from "@/components/admin/charts/chart-tooltip";

export type TrendPoint = { label: string; value: number };

/**
 * Area/line trend for time-series (e.g. enquiries over time).
 */
export function TrendChart({
  data,
  height = 240,
  valueLabel = "Value",
  ariaLabel,
}: {
  data: TrendPoint[];
  height?: number;
  valueLabel?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `${valueLabel} trend`}
      className="min-w-0 w-full"
      style={{ height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: CHART_GRID }}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: CHART_AXIS, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: CHART_GRID }}
            content={({ active, label, payload }) => (
              <ChartTooltip
                active={active}
                label={label}
                payload={payload as never}
                formatter={(value) => `${value} ${valueLabel.toLowerCase()}`}
              />
            )}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_ACCENT}
            strokeWidth={2}
            fill="url(#trendFill)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
