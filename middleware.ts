import { NextResponse, type NextRequest } from "next/server";

/**
 * Self-contained Edge middleware — no `@/` or local package imports.
 * Vercel Edge Functions fail when middleware references aliased app modules.
 */

const ADMIN_SESSION_COOKIE = "architak_admin_session";

type SessionPayload = {
  u: string;
  exp: number;
};

function getAdminBasePath(): string {
  return process.env.ADMIN_BASE_PATH?.replace(/\/$/, "") || "/admin";
}

function toBase64Url(value: string): string {
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function base64UrlToBytes(value: string): Uint8Array {
  const binary = fromBase64Url(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  for (const byte of view) {
    binary += String.fromCharCode(byte);
  }
  return toBase64Url(binary);
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
}

async function hmacSign(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(signature);
}

async function decodeSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }

  const [body, signature] = token.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = await hmacSign(body, secret);
  const a = base64UrlToBytes(signature);
  const b = base64UrlToBytes(expected);
  if (!timingSafeEqualBytes(a, b)) {
    return null;
  }

  try {
    const parsed = JSON.parse(fromBase64Url(body)) as SessionPayload;
    if (typeof parsed.u !== "string" || typeof parsed.exp !== "number") {
      return null;
    }
    if (parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function applySecurityHeaders(response: NextResponse): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  response.headers.set("X-Frame-Options", "DENY");

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.r2.cloudflarestorage.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminBase = getAdminBasePath();
  const isAdminRoute = pathname === adminBase || pathname.startsWith(`${adminBase}/`);
  const isLoginRoute = pathname === `${adminBase}/login`;

  let response: NextResponse;

  if (isAdminRoute) {
    let authenticated = false;
    try {
      authenticated = Boolean(
        await decodeSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value),
      );
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|media/).*)"],
};
