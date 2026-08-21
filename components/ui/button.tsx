import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-foreground bg-foreground text-background hover:bg-transparent hover:text-foreground",
  secondary: "border border-border text-foreground hover:border-accent hover:text-accent",
  ghost: "border border-transparent text-muted hover:text-foreground",
};

const SIZES: Record<ButtonSize, string> = {
  // Minimum heights keep the target comfortable on touch without looking
  // oversized under a precise pointer.
  sm: "min-h-9 px-4 py-2 text-fluid-xs",
  md: "min-h-11 px-6 py-3 text-fluid-sm",
  lg: "min-h-12 px-8 py-4 text-fluid-base",
};

export const buttonClasses = (
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) =>
  cn(
    "inline-flex items-center justify-center gap-2 tracking-widest uppercase",
    "transition-colors duration-[var(--duration-micro)] ease-[var(--ease-standard)]",
    // A disabled control must remain perceivable, not vanish.
    "disabled:cursor-not-allowed disabled:opacity-50",
    "aria-disabled:cursor-not-allowed aria-disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Marks an in-flight submission. Keeps the button focusable and announced
   * while preventing a second dispatch, which `disabled` alone would do at the
   * cost of losing focus.
   */
  pending?: boolean;
  pendingLabel?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  pending = false,
  pendingLabel = "Working",
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-disabled={pending || props.disabled ? true : undefined}
      aria-busy={pending || undefined}
      onClick={pending ? undefined : props.onClick}
      className={buttonClasses(variant, size, className)}
    >
      {pending ? (
        <>
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 animate-pulse rounded-full bg-current"
          />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}
