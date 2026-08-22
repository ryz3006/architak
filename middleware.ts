import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  HERO_JOURNEY_COOKIE,
  HERO_JOURNEY_COOKIE_MAX_AGE,
  HERO_JOURNEY_HEADER,
  isHeroJourneyId,
  pickRandomHeroJourneyId,
} from "@/lib/hero/constants";

/**
 * Assign a curated hero journey before the homepage renders.
 * Next.js only allows cookie writes in middleware, route handlers, or actions.
 *
 * The same-request page read uses the request header; the Set-Cookie on the
 * response persists the choice for later visits.
 */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") {
    return NextResponse.next();
  }

  const existing = request.cookies.get(HERO_JOURNEY_COOKIE)?.value;
  if (isHeroJourneyId(existing)) {
    return NextResponse.next();
  }

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
