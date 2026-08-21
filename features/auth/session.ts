import "server-only";

import { cookies } from "next/headers";

import {
  decodeSession,
  encodeSession,
  timingSafeStringEqual,
  type SessionPayload,
} from "@/features/auth/session-token";
import { getServerEnv } from "@/lib/env";

export const ADMIN_SESSION_COOKIE = "architak_admin_session";

const SESSION_TTL_SECONDS = 60 * 60 * 12;

export function verifyCredentials(username: string, password: string): boolean {
  const env = getServerEnv();
  return (
    timingSafeStringEqual(username, env.ADMIN_USERNAME) &&
    timingSafeStringEqual(password, env.ADMIN_PASSWORD)
  );
}

export async function createSessionToken(username: string): Promise<string> {
  const payload: SessionPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  return encodeSession(payload);
}

export async function getAdminSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  return decodeSession(jar.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function sessionCookieOptions(token: string) {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
