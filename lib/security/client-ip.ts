import "server-only";

/**
 * Best-effort client IP for rate limiting.
 * Prefer the first X-Forwarded-For hop (Vercel); never trust as identity.
 */
export function getClientIp(headersList: Headers): string {
  const forwarded = headersList.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  if (first) return first;
  const realIp = headersList.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function getClientIpFromRequest(request: Request): string {
  return getClientIp(request.headers);
}
