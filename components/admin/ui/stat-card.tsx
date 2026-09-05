import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { Card } from "@/components/admin/ui/card";
import { Sparkline } from "@/components/admin/charts/sparkline";

export type StatCardProps = {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  hint?: string;
  href?: string;
  /** Percentage delta vs. previous period; sign drives the trend arrow. */
  delta?: number;
  deltaLabel?: string;
  spark?: number[];
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  delta,
  deltaLabel,
  spark,
}: StatCardProps) {
  const trend = delta == null ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  const body = (
    <Card
      className={cn(
        "flex h-full flex-col gap-3 p-5",
        href && "transition-colors hover:border-[var(--admin-border-strong)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-fluid-xs font-medium uppercase tracking-wide text-muted">{label}</span>
        {Icon ? <Icon className="size-4 text-muted" aria-hidden="true" /> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="text-display-sm font-semibold leading-none text-foreground">{value}</span>
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-fluid-xs",
              trend === "up" && "text-[var(--admin-success)]",
              trend === "down" && "text-[var(--admin-danger)]",
              trend === "flat" && "text-muted",
            )}
          >
            <TrendIcon className="size-3.5" aria-hidden="true" />
            {deltaLabel ?? `${delta! > 0 ? "+" : ""}${delta}%`}
          </span>
        ) : null}
      </div>
      {spark && spark.length > 1 ? <Sparkline data={spark} /> : null}
      {hint ? <p className="text-fluid-xs text-muted">{hint}</p> : null}
    </Card>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block min-w-0 rounded-[var(--admin-radius)] focus-visible:outline-none"
      >
        {body}
      </Link>
    );
  }
  return body;
}
