import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class-name composer.
 *
 * Uses `clsx` for conditional composition and `tailwind-merge` so that a
 * caller-supplied `className` reliably overrides conflicting utilities from a
 * component's base classes (e.g. `px-6` passed by a caller wins over a default
 * `px-4`). Custom project utilities that tailwind-merge does not recognise
 * (`text-fluid-*`, `page-frame`, `display`, `measure`, ...) are preserved
 * unchanged, so existing markup keeps its behaviour.
 */
export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}
