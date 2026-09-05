import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export const adminControlClasses = cn(
  "w-full rounded-[var(--admin-radius-sm)] border border-[var(--admin-border-strong)] bg-[var(--admin-surface)]",
  "px-3 py-2 text-fluid-sm text-foreground placeholder:text-muted",
  "transition-colors duration-[var(--duration-micro)]",
  "focus-visible:border-accent focus-visible:outline-none",
  "aria-[invalid=true]:border-[var(--admin-danger)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type = "text", ...props }: InputProps) {
  return <input type={type} className={cn(adminControlClasses, "h-11", className)} {...props} />;
}
