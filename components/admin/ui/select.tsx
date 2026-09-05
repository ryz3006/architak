import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";
import { adminControlClasses } from "@/components/admin/ui/input";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

/**
 * Native select styled to match admin controls. Native is intentional: it is
 * accessible by default, keyboard-friendly, and works without JS for the
 * simple option lists used across the CMS.
 */
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(adminControlClasses, "h-11 appearance-none pr-9", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
