import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

/**
 * Admin button. Productivity-focused (rounded, not the editorial uppercase
 * treatment of the public-site button in `components/ui/button.tsx`).
 */
export const adminButtonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--admin-radius-sm)]",
    "text-fluid-sm font-medium transition-colors duration-[var(--duration-micro)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ),
  {
    variants: {
      variant: {
        primary: "bg-accent text-background hover:bg-[color-mix(in_srgb,var(--color-accent)_88%,white)]",
        secondary:
          "border border-[var(--admin-border-strong)] bg-[var(--admin-surface-raised)] text-foreground hover:border-accent",
        outline:
          "border border-[var(--admin-border-strong)] bg-transparent text-foreground hover:bg-[var(--admin-surface)]",
        ghost: "text-muted hover:bg-[var(--admin-surface)] hover:text-foreground",
        destructive:
          "bg-[var(--admin-danger)] text-background hover:bg-[color-mix(in_srgb,var(--admin-danger)_88%,black)]",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-6 text-fluid-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof adminButtonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: AdminButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      type={asChild ? undefined : (type ?? "button")}
      className={cn(adminButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
