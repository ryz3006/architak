import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { enforceTrafficRetention } from "@/features/analytics/collect";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_SECRET_LENGTH = 32;

function getExpectedSecret(): string | null {
  const expected = process.env.CRON_SECRET?.trim() ?? "";
  if (expected.length < MIN_SECRET_LENGTH) return null;
  return expected;
}

function authorized(request: Request, expected: string): boolean {
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!bearer) return false;
  const a = Buffer.from(bearer);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Prune page_views older than 30 days and keep the relation under ~25 MB.
 */
export async function GET(request: Request) {
  const ip = getClientIpFromRequest(request);
  const expected = getExpectedSecret();
  if (!expected) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );
  }

  if (!authorized(request, expected)) {
    const limit = checkRateLimit(`cron-traffic-auth-fail:${ip}`, 20, 60_000);
    if (!limit.ok) {
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, error: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
          },
        ),
      );
    }
    return applySecurityHeaders(
      NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 }),
    );
  }

  const result = await enforceTrafficRetention();
  console.info(JSON.stringify({ event: "traffic_retention", ...result }));
  return applySecurityHeaders(NextResponse.json(result));
}

export function POST() {
  return applySecurityHeaders(
    NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 }),
  );
}
