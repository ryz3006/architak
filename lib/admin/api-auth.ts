import "server-only";

import { NextResponse } from "next/server";

import { getAdminSession } from "@/features/auth/session";

/**
 * Shared guard for admin API route handlers.
 * Returns the session or a 401 JSON response.
 */
export async function requireAdminApiSession(): Promise<
  { ok: true; username: string } | { ok: false; response: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, username: session.u };
}
