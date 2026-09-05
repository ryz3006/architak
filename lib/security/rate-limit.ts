import { getServerEnv, isDurableRateLimitConfigured } from "@/lib/env";

/**
 * Rate limiter for login / public forms.
 *
 * Uses a durable fixed-window counter in Upstash Redis (REST) when
 * `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` are configured, so
 * limits hold across serverless instances and regions. Falls back to an
 * in-memory window for local/single-instance use and on transport errors.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { ok: true } | { ok: false; retryAfterMs: number };

async function upstashPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  const env = getServerEnv();
  const res = await fetch(`${env.UPSTASH_REDIS_REST_URL.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Upstash HTTP ${res.status}`);
  const data = (await res.json()) as Array<{ result?: unknown; error?: string }>;
  return data.map((entry) => entry.result);
}

/**
 * Durable-first rate limit check. Prefer this in server actions / route
 * handlers. Returns the same shape as {@link checkRateLimit}.
 */
export async function checkRateLimitDurable(
  key: string,
  max: number,
  windowMs: number,
): Promise<RateLimitResult> {
  if (!isDurableRateLimitConfigured()) {
    return checkRateLimit(key, max, windowMs);
  }
  try {
    const results = await upstashPipeline([
      ["INCR", key],
      ["PEXPIRE", key, windowMs, "NX"],
      ["PTTL", key],
    ]);
    const count = Number(results[0] ?? 0);
    const ttl = Number(results[2] ?? windowMs);
    if (count > max) {
      return { ok: false, retryAfterMs: ttl > 0 ? ttl : windowMs };
    }
    return { ok: true };
  } catch {
    // Fail over to the in-memory limiter rather than locking admins out.
    return checkRateLimit(key, max, windowMs);
  }
}

/** True when durable (Upstash) rate limiting is active. */
export function rateLimitBackend(): "upstash" | "memory" {
  try {
    return isDurableRateLimitConfigured() ? "upstash" : "memory";
  } catch {
    return "memory";
  }
}

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
