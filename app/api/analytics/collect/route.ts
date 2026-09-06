import { NextResponse } from "next/server";

import { collectPageView } from "@/features/analytics/collect";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimitDurable } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public page-view beacon. Privacy-light: no raw IP stored; geo from platform
 * headers; browser/device are coarse families only.
 */
export async function POST(request: Request) {
  const ip = getClientIpFromRequest(request);
  const env = getServerEnv();
  const limit = await checkRateLimitDurable(
    `analytics-collect:${ip}`,
    Math.min(env.RATE_LIMIT_MAX * 3, 60),
    env.RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
        },
      ),
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return applySecurityHeaders(NextResponse.json({ ok: false }, { status: 400 }));
  }

  const result = await collectPageView(body, request.headers);
  if (!result.ok) {
    return applySecurityHeaders(
      NextResponse.json({ ok: false }, { status: result.status }),
    );
  }

  return applySecurityHeaders(NextResponse.json({ ok: true }));
}

export function GET() {
  return applySecurityHeaders(
    NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 }),
  );
}
