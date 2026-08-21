import { NextResponse, type NextRequest } from "next/server";

import { decodeSession } from "@/features/auth/session-token";
import { applySecurityHeaders } from "@/lib/security/headers";

const ADMIN_SESSION_COOKIE = "architak_admin_session";

function getAdminBasePath(): string {
  return process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminBase = getAdminBasePath();
  const isAdminRoute = pathname === adminBase || pathname.startsWith(`${adminBase}/`);
  const isLoginRoute = pathname === `${adminBase}/login`;

  let response: NextResponse;

  if (isAdminRoute) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    let authenticated = false;

    try {
      authenticated = Boolean(await decodeSession(token));
    } catch {
      authenticated = false;
    }

    if (!authenticated && !isLoginRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `${adminBase}/login`;
      loginUrl.searchParams.set("next", pathname);
      response = NextResponse.redirect(loginUrl);
    } else if (authenticated && isLoginRoute) {
      const adminUrl = request.nextUrl.clone();
      adminUrl.pathname = adminBase;
      adminUrl.search = "";
      response = NextResponse.redirect(adminUrl);
    } else {
      response = NextResponse.next();
    }

    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  } else {
    response = NextResponse.next();
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
