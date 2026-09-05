"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearSessionCookieOptions,
  createSessionToken,
  sessionCookieOptions,
  verifyCredentials,
} from "@/features/auth/session";
import { getAdminBasePath, getServerEnv } from "@/lib/env";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").slice(0, 120);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const env = getServerEnv();
  const headerStore = await headers();
  const ip = getClientIp(headerStore);
  // Login is stricter than generic API limits — credential stuffing defense.
  const limit = checkRateLimit(`admin-login:${ip}`, Math.min(env.RATE_LIMIT_MAX, 10), env.RATE_LIMIT_WINDOW_MS);

  if (!limit.ok) {
    return { error: "Too many attempts. Try again shortly." };
  }

  if (!verifyCredentials(username, password)) {
    return { error: "Invalid credentials." };
  }

  const token = await createSessionToken(username);
  const jar = await cookies();
  jar.set(sessionCookieOptions(token));

  redirect(getAdminBasePath());
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.set(clearSessionCookieOptions());
  redirect(`${getAdminBasePath()}/login`);
}
