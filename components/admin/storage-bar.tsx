import { cn } from "@/lib/cn";
import type { StorageUsage } from "@/features/media/storage-accounting";

export function StorageBar({
  usage,
  className,
}: {
  usage: Pick<
    StorageUsage,
    "percentUsed" | "state" | "formatted" | "remainingBytes" | "totalBytes" | "maxBytes"
  >;
  className?: string;
}) {
  const label =
    usage.state === "full" ? "Full" : usage.state === "warning" ? "Warning" : "Healthy";

  return (
    <div className={cn("border border-border p-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-fluid-xs tracking-widest text-muted uppercase">Content storage</p>
        <p
          className={cn(
            "text-fluid-xs tracking-widest uppercase",
            usage.state === "healthy" && "text-accent",
            usage.state === "warning" && "text-foreground",
            usage.state === "full" && "text-red-300",
          )}
        >
          {label}
        </p>
      </div>
      <p className="display mt-3 text-display-sm">
        {usage.formatted.total} / {usage.formatted.max}
      </p>
      <div
        className="mt-4 h-2 w-full bg-surface"
        role="progressbar"
        aria-valuenow={usage.percentUsed}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Storage ${usage.percentUsed}% used`}
      >
        <div
          className={cn(
            "h-full transition-[width] duration-[var(--duration-medium)]",
            usage.state === "healthy" && "bg-accent",
            usage.state === "warning" && "bg-foreground",
            usage.state === "full" && "bg-red-300",
          )}
          style={{ width: `${Math.min(100, usage.percentUsed)}%` }}
        />
      </div>
      <p className="mt-3 text-fluid-sm text-muted">
        {usage.percentUsed}% used · {usage.formatted.remaining} remaining
      </p>
    </div>
  );
}
