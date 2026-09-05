import { NextResponse } from "next/server";

import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

export function GET(request: Request) {
  const ip = getClientIpFromRequest(request);
  const limit = checkRateLimit(`health:${ip}`, 60, 60_000);
  if (!limit.ok) {
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false, error: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
        },
      ),
    );
  }

  const response = NextResponse.json({
    ok: true,
    service: "architak",
    timestamp: new Date().toISOString(),
  });
  response.headers.set("Cache-Control", "no-store");
  return applySecurityHeaders(response);
}
