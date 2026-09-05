import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-fluid-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] text-muted",
        accent: "border-transparent bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)] text-accent",
        success:
          "border-transparent bg-[color-mix(in_srgb,var(--admin-success)_18%,transparent)] text-[var(--admin-success)]",
        warning:
          "border-transparent bg-[color-mix(in_srgb,var(--admin-warning)_18%,transparent)] text-[var(--admin-warning)]",
        danger:
          "border-transparent bg-[color-mix(in_srgb,var(--admin-danger)_18%,transparent)] text-[var(--admin-danger)]",
        info: "border-transparent bg-[color-mix(in_srgb,var(--admin-info)_18%,transparent)] text-[var(--admin-info)]",
        outline: "border-[var(--admin-border-strong)] text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
