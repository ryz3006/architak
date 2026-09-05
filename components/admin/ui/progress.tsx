import { cn } from "@/lib/cn";

type ProgressState = "healthy" | "warning" | "full";

/**
 * Accessible progress bar (storage quotas, completion, etc.).
 */
export function Progress({
  value,
  max = 100,
  state = "healthy",
  label,
  className,
}: {
  value: number;
  max?: number;
  state?: ProgressState;
  label?: string;
  className?: string;
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-[var(--admin-surface-raised)]", className)}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-[var(--duration-medium)]",
          state === "healthy" && "bg-accent",
          state === "warning" && "bg-[var(--admin-warning)]",
          state === "full" && "bg-[var(--admin-danger)]",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
