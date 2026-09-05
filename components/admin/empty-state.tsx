import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/admin/ui/card";

/**
 * Guided empty state. Non-technical users get a clear next step instead of a
 * blank screen.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center">
      {Icon ? (
        <span className="flex size-11 items-center justify-center rounded-full bg-[var(--admin-surface-raised)]">
          <Icon className="size-5 text-muted" aria-hidden="true" />
        </span>
      ) : null}
      <div>
        <p className="text-fluid-base font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-[42ch] text-fluid-sm text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </Card>
  );
}
