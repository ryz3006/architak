"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { recordLoginEvent } from "@/features/auth/audit";
import {
  clearSessionCookieOptions,
  createSessionToken,
  sessionCookieOptions,
  verifyCredentials,
} from "@/features/auth/session";
import { getAdminBasePath, getServerEnv } from "@/lib/env";
import { getClientIp } from "@/lib/security/client-ip";
import { isSameOrigin } from "@/lib/security/csrf";
import { checkRateLimitDurable } from "@/lib/security/rate-limit";

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

  // CSRF: reject cross-origin submissions.
  if (!isSameOrigin(headerStore)) {
    return { error: "Request blocked. Please retry from the site." };
  }

  const ip = getClientIp(headerStore);
  const userAgent = headerStore.get("user-agent");

  // Durable, dedicated login limit — credential-stuffing defense.
  const limit = await checkRateLimitDurable(
    `admin-login:${ip}`,
    env.LOGIN_RATE_LIMIT_MAX,
    env.LOGIN_RATE_LIMIT_WINDOW_MS,
  );
  if (!limit.ok) {
    await recordLoginEvent({ success: false, username, ip, userAgent });
    return { error: "Too many attempts. Try again shortly." };
  }

  if (!verifyCredentials(username, password)) {
    await recordLoginEvent({ success: false, username, ip, userAgent });
    return { error: "Invalid credentials." };
  }

  await recordLoginEvent({ success: true, username, ip, userAgent });

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
