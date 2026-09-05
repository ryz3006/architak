import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  sessionCookieBase,
  sessionCookieMaxAgeSeconds,
} from "@/features/auth/cookie";
import { decodeSession, refreshSession } from "@/features/auth/session-token";
import {
  HERO_JOURNEY_COOKIE,
  HERO_JOURNEY_COOKIE_MAX_AGE,
  HERO_JOURNEY_HEADER,
  pickRandomHeroJourneyId,
} from "@/lib/hero/constants";

function adminBasePath(): string {
  return process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
}

/**
 * Homepage: assign a curated hero journey before render (cookies can only be
 * written from proxy / route handlers / Server Actions). The chosen id is also
 * forwarded on a request header so the same render pass can read it.
 */
function handleHome(request: NextRequest): NextResponse {
  const journeyId = pickRandomHeroJourneyId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HERO_JOURNEY_HEADER, journeyId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.set(HERO_JOURNEY_COOKIE, journeyId, {
    path: "/",
    maxAge: HERO_JOURNEY_COOKIE_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

/**
 * Admin edge gate: fast, defense-in-depth session check on document
 * navigations. Unauthenticated GETs are redirected to login; valid sessions
 * get a refreshed idle window (sliding expiry). Server code still runs the
 * authoritative check (including revocation) via `requireAdminSession`.
 */
async function handleAdmin(request: NextRequest, base: string): Promise<NextResponse> {
  // Only gate top-level GET navigations. Server Action POSTs are authorised
  // server-side and must not be redirected (that would re-POST to login).
  if (request.method !== "GET") return NextResponse.next();

  const path = request.nextUrl.pathname;
  const loginPath = `${base}/login`;
  const isLoginRoute = path === loginPath;

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  let session = null;
  try {
    session = await decodeSession(token);
  } catch {
    session = null;
  }

  if (isLoginRoute) {
    // Already signed in — skip the login form.
    if (session) return NextResponse.redirect(new URL(base, request.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL(loginPath, request.url);
    if (path && path !== base) url.searchParams.set("from", path);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  try {
    const refreshed = await refreshSession(session);
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: refreshed,
      ...sessionCookieBase(),
      maxAge: sessionCookieMaxAgeSeconds(),
    });
  } catch {
    // Non-fatal: keep serving with the existing cookie.
  }
  return response;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const path = request.nextUrl.pathname;
  const base = adminBasePath();

  if (path === base || path.startsWith(`${base}/`)) {
    return handleAdmin(request, base);
  }

  if (path === "/") {
    return handleHome(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"],
};
