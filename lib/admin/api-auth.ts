import "server-only";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/features/auth/session";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import { headers } from "next/headers";

/**
 * Shared guard for admin API route handlers.
 * Returns the session or a 401/429 JSON response.
 */
export async function requireAdminApiSession(): Promise<
  { ok: true; username: string } | { ok: false; response: NextResponse }
> {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  // Cap unauthenticated probing of admin APIs (stolen cookies / brute session).
  const probeLimit = checkRateLimit(`admin-api-probe:${ip}`, 60, 60_000);
  if (!probeLimit.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(probeLimit.retryAfterMs / 1000)) },
        },
      ),
    };
  }

  const session = await getAdminSession();
  if (!session) {
    const failLimit = checkRateLimit(`admin-api-unauth:${ip}`, 30, 60_000);
    if (!failLimit.ok) {
      return {
        ok: false,
        response: NextResponse.json(
          { ok: false, message: "Too many requests" },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(failLimit.retryAfterMs / 1000)) },
          },
        ),
      };
    }
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }),
    };
  }

  // Authenticated abuse ceiling (stolen session scripted flood).
  const authedLimit = checkRateLimit(`admin-api:${session.u}:${ip}`, 120, 60_000);
  if (!authedLimit.ok) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, message: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(authedLimit.retryAfterMs / 1000)) },
        },
      ),
    };
  }

  return { ok: true, username: session.u };
}
