/**
 * In-memory rate limiter for login / public forms.
 * Suitable for single-instance and edge middleware approximations;
 * replace with durable store before multi-region production scale.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= max) {
    return { ok: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true };
}
