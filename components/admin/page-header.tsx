import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * Standard in-page header used across admin screens: title, optional
 * description, and an actions slot on the right. Keeps every page consistent
 * so business users always know where the primary action lives.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-display-sm font-semibold leading-tight text-foreground">{title}</h2>
        {description ? (
          <p className="mt-1.5 max-w-[60ch] text-fluid-sm text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
