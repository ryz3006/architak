"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { recordSecurityEvent } from "@/features/auth/audit";
import { bumpSessionEpoch } from "@/features/auth/revocation";
import {
  clearSessionCookieOptions,
  getAdminSession,
  requireAdminSession,
} from "@/features/auth/session";
import { getAdminBasePath } from "@/lib/env";
import { isSameOrigin } from "@/lib/security/csrf";

/**
 * Revoke every active session ("sign out everywhere") by bumping the session
 * epoch, then clear the current cookie and return to login.
 */
export async function signOutEverywhereAction(): Promise<void> {
  const session = await requireAdminSession();
  const headerStore = await headers();
  if (!isSameOrigin(headerStore)) {
    redirect(`${getAdminBasePath()}/security`);
  }

  await bumpSessionEpoch();
  await recordSecurityEvent("auth.sessions_revoked", session.u);

  const jar = await cookies();
  jar.set(clearSessionCookieOptions());
  redirect(`${getAdminBasePath()}/login`);
}

/** Sign out the current session only. */
export async function signOutAction(): Promise<void> {
  await getAdminSession();
  const jar = await cookies();
  jar.set(clearSessionCookieOptions());
  redirect(`${getAdminBasePath()}/login`);
}
