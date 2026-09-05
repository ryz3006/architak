"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { CHART_ACCENT } from "@/components/admin/charts/palette";

/**
 * Compact inline trend for KPI stat cards. Decorative, so it is hidden from
 * assistive tech; the numeric KPI beside it carries the meaning.
 */
export function Sparkline({ data, height = 40 }: { data: number[]; height?: number }) {
  const points = data.map((value, index) => ({ index, value }));
  return (
    <div aria-hidden="true" style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_ACCENT} stopOpacity={0.4} />
              <stop offset="100%" stopColor={CHART_ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_ACCENT}
            strokeWidth={1.5}
            fill="url(#sparkFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
