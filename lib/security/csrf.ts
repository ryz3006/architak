import "server-only";

type HeaderReader = { get(name: string): string | null };

/**
 * Same-origin assertion for state-changing Server Actions. When an Origin
 * header is present it must match the Host; requests from a different origin
 * are rejected. This complements Next's built-in action origin checks.
 */
export function isSameOrigin(headerStore: HeaderReader): boolean {
  const origin = headerStore.get("origin");
  if (!origin) return true; // Non-CORS navigations may omit Origin.
  const host = headerStore.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
