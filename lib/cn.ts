/**
 * Minimal class-name joiner.
 *
 * Deliberately dependency-free: the project needs conditional class composition
 * but not Tailwind conflict resolution, so `clsx` and `tailwind-merge` would be
 * weight without benefit here.
 */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
