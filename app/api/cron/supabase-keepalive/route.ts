import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { getPublishableSupabase } from "@/lib/supabase/server";
import { applySecurityHeaders } from "@/lib/security/headers";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIpFromRequest } from "@/lib/security/client-ip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_SECRET_LENGTH = 32;
const AUTH_FAIL_MAX = 20;
const AUTH_FAIL_WINDOW_MS = 60_000;

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

function unauthorized(retryAfterMs?: number): NextResponse {
  const response = NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  if (retryAfterMs != null) {
    response.headers.set("Retry-After", String(Math.ceil(retryAfterMs / 1000)));
  }
  return applySecurityHeaders(response);
}

/**
 * Lightweight Supabase read to prevent free-tier inactivity pause.
 * Invoked by Vercel Cron and/or GitHub Actions — not by public browsers.
 */
export async function GET(request: Request) {
  const ip = getClientIpFromRequest(request);
  const expected = getExpectedSecret();

  if (!expected) {
    // Misconfigured deployment: fail closed without hitting the database.
    return unauthorized();
  }

  if (!authorized(request, expected)) {
    const limit = checkRateLimit(`cron-auth-fail:${ip}`, AUTH_FAIL_MAX, AUTH_FAIL_WINDOW_MS);
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
    return unauthorized();
  }

  const started = Date.now();
  try {
    const supabase = getPublishableSupabase();
    const { error } = await supabase.from("pages").select("id", { head: true }).limit(1);

    if (error) {
      console.error(
        JSON.stringify({
          event: "supabase_keepalive_failed",
          code: error.code ?? "unknown",
          durationMs: Date.now() - started,
        }),
      );
      return applySecurityHeaders(
        NextResponse.json(
          { ok: false, error: "Supabase query failed", durationMs: Date.now() - started },
          { status: 503 },
        ),
      );
    }

    console.info(
      JSON.stringify({
        event: "supabase_keepalive_ok",
        durationMs: Date.now() - started,
      }),
    );

    return applySecurityHeaders(
      NextResponse.json({
        ok: true,
        service: "supabase-keepalive",
        durationMs: Date.now() - started,
        timestamp: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "supabase_keepalive_unavailable",
        error: error instanceof Error ? error.name : "unknown",
        durationMs: Date.now() - started,
      }),
    );
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false, error: "Supabase unavailable", durationMs: Date.now() - started },
        { status: 503 },
      ),
    );
  }
}

export function POST() {
  return applySecurityHeaders(
    NextResponse.json({ ok: false, error: "Method not allowed" }, { status: 405 }),
  );
}
