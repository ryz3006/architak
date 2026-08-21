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

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const env = getServerEnv();
  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(
    `admin-login:${ip}`,
    env.RATE_LIMIT_MAX,
    env.RATE_LIMIT_WINDOW_MS,
  );

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
