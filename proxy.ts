import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  HERO_JOURNEY_COOKIE,
  HERO_JOURNEY_COOKIE_MAX_AGE,
  HERO_JOURNEY_HEADER,
  pickRandomHeroJourneyId,
} from "@/lib/hero/constants";

/**
 * Assigns a curated hero journey before the homepage renders.
 *
 * Cookies can only be written from proxy, route handlers, or Server Actions —
 * never during a page render. The chosen id is also forwarded on a request
 * header because a cookie set on the response is not readable by the same
 * render pass.
 */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  // Fresh curated stills on every homepage load; the header keeps the render in sync.
  const journeyId = pickRandomHeroJourneyId();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(HERO_JOURNEY_HEADER, journeyId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set(HERO_JOURNEY_COOKIE, journeyId, {
    path: "/",
    maxAge: HERO_JOURNEY_COOKIE_MAX_AGE,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: "/",
};
