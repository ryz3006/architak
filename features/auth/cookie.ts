/**
 * Isomorphic admin-session cookie constants + option builders.
 *
 * Kept free of `server-only` and secret access so the edge proxy can read and
 * refresh the cookie while server code reuses the same definitions.
 */
export const ADMIN_SESSION_COOKIE = "architak_admin_session";

type BaseCookie = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
};

export function sessionCookieBase(): BaseCookie {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function sessionCookieMaxAgeSeconds(): number {
  const hours = Number(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS) || 12;
  return hours * 60 * 60;
}
