import "server-only";

import { getSecretSupabase } from "@/lib/supabase/server";

export type LoginEvent = {
  id: number;
  action: string;
  success: boolean;
  username: string | null;
  ip: string | null;
  userAgent: string | null;
  at: string;
};

/** Record an admin login attempt. Never throws — auditing must not block auth. */
export async function recordLoginEvent(input: {
  success: boolean;
  username: string;
  ip: string | null;
  userAgent: string | null;
}): Promise<void> {
  try {
    const supabase = getSecretSupabase();
    await supabase.from("audit_events").insert({
      action: input.success ? "auth.login_succeeded" : "auth.login_failed",
      entity_type: "auth",
      entity_id: input.username || null,
      ip_address: input.ip,
      after_data: {
        username: input.username,
        userAgent: input.userAgent,
      } as never,
    });
  } catch {
    // Swallow — auditing is best-effort.
  }
}

/** Record a session revocation ("sign out everywhere"). */
export async function recordSecurityEvent(action: string, username: string): Promise<void> {
  try {
    const supabase = getSecretSupabase();
    await supabase.from("audit_events").insert({
      action,
      entity_type: "auth",
      entity_id: username || null,
    });
  } catch {
    // Best-effort.
  }
}

export async function listLoginEvents(limit = 15): Promise<LoginEvent[]> {
  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("audit_events")
      .select("id, action, entity_id, ip_address, after_data, created_at")
      .like("action", "auth.%")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];

    return (data ?? []).map((row) => {
      const after = (row.after_data ?? {}) as { userAgent?: unknown };
      return {
        id: row.id as number,
        action: row.action as string,
        success: (row.action as string) === "auth.login_succeeded",
        username: (row.entity_id as string | null) ?? null,
        ip: (row.ip_address as string | null) ?? null,
        userAgent: typeof after.userAgent === "string" ? after.userAgent : null,
        at: row.created_at as string,
      };
    });
  } catch {
    return [];
  }
}
