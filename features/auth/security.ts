import "server-only";

import { getAdminSession } from "@/features/auth/session";
import {
  absoluteTimeoutSeconds,
  idleTimeoutSeconds,
} from "@/features/auth/session-token";
import { getServerEnv, isDurableRateLimitConfigured } from "@/lib/env";

export type SessionStatus = {
  username: string;
  issuedAt: string;
  absoluteExpiresAt: string;
  idleExpiresAt: string;
  idleTimeoutMinutes: number;
  absoluteTimeoutHours: number;
} | null;

export async function getSessionStatus(): Promise<SessionStatus> {
  const session = await getAdminSession();
  if (!session) return null;
  return {
    username: session.u,
    issuedAt: new Date(session.iat * 1000).toISOString(),
    absoluteExpiresAt: new Date(session.exp * 1000).toISOString(),
    idleExpiresAt: new Date(session.idle * 1000).toISOString(),
    idleTimeoutMinutes: Math.round(idleTimeoutSeconds() / 60),
    absoluteTimeoutHours: Math.round(absoluteTimeoutSeconds() / 3600),
  };
}

export type PasswordPolicyStatus = {
  length: number;
  strength: "weak" | "fair" | "strong";
  issues: string[];
};

/**
 * Qualitative assessment of the shared admin credential. Never returns the
 * password itself — only length and remediation hints for the security page.
 */
export function getPasswordPolicyStatus(): PasswordPolicyStatus {
  const env = getServerEnv();
  const password = env.ADMIN_PASSWORD;
  const length = password.length;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;

  const issues: string[] = [];
  if (length < 12) issues.push("Use at least 12 characters.");
  if (classes < 3) issues.push("Mix upper/lowercase, numbers and symbols.");
  if (password.toLowerCase() === env.ADMIN_USERNAME.toLowerCase()) {
    issues.push("Password must not match the username.");
  }

  let strength: PasswordPolicyStatus["strength"] = "weak";
  if (length >= 16 && classes >= 3) strength = "strong";
  else if (length >= 12 && classes >= 2) strength = "fair";

  return { length, strength, issues };
}

export type SecurityOverview = {
  session: SessionStatus;
  rateLimitBackend: "upstash" | "memory";
  durableConfigured: boolean;
  password: PasswordPolicyStatus;
};

export async function getSecurityOverview(): Promise<SecurityOverview> {
  return {
    session: await getSessionStatus(),
    rateLimitBackend: isDurableRateLimitConfigured() ? "upstash" : "memory",
    durableConfigured: isDurableRateLimitConfigured(),
    password: getPasswordPolicyStatus(),
  };
}
