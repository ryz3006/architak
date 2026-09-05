import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADMIN_SESSION_COOKIE,
  sessionCookieBase,
  sessionCookieMaxAgeSeconds,
} from "@/features/auth/cookie";
import { getSessionEpoch } from "@/features/auth/revocation";
import {
  absoluteTimeoutSeconds,
  decodeSession,
  encodeSession,
  idleTimeoutSeconds,
  timingSafeStringEqual,
  type SessionPayload,
} from "@/features/auth/session-token";
import { getServerEnv } from "@/lib/env";

export { ADMIN_SESSION_COOKIE };

export function verifyCredentials(username: string, password: string): boolean {
  const env = getServerEnv();
  return (
    timingSafeStringEqual(username, env.ADMIN_USERNAME) &&
    timingSafeStringEqual(password, env.ADMIN_PASSWORD)
  );
}

export async function createSessionToken(username: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const epoch = await getSessionEpoch();
  const payload: SessionPayload = {
    u: username,
    iat: now,
    exp: now + absoluteTimeoutSeconds(),
    idle: now + idleTimeoutSeconds(),
    v: epoch,
  };
  return encodeSession(payload);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  try {
    const jar = await cookies();
    const session = await decodeSession(jar.get(ADMIN_SESSION_COOKIE)?.value);
    if (!session) return null;
    // Revocation: reject tokens minted before the current epoch.
    const epoch = await getSessionEpoch();
    if (session.v < epoch) return null;
    return session;
  } catch {
    return null;
  }
}

/** Redirects to login when there is no valid admin session. */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    ...sessionCookieBase(),
    maxAge: sessionCookieMaxAgeSeconds(),
  };
}

export function clearSessionCookieOptions() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    ...sessionCookieBase(),
    maxAge: 0,
  };
}
