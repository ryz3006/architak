import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { getTelegramConfig } from "@/features/notifications/config";
import { getTelegramProvider } from "@/features/notifications/providers/telegram";
import { getSecretSupabase } from "@/lib/supabase/server";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const config = getTelegramConfig();
  const status = getTelegramProvider().getStatus();

  let lastSuccess: string | null = null;
  let lastFailure: string | null = null;
  let failed24h = 0;

  try {
    const supabase = getSecretSupabase();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [{ data: sent }, { data: failed }, { count }] = await Promise.all([
      supabase
        .from("enquiry_events")
        .select("created_at")
        .eq("event_type", "notification_sent")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("enquiry_events")
        .select("created_at")
        .eq("event_type", "notification_failed")
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("enquiry_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "notification_failed")
        .gte("created_at", dayAgo),
    ]);

    lastSuccess = sent?.[0]?.created_at ?? null;
    lastFailure = failed?.[0]?.created_at ?? null;
    failed24h = count ?? 0;
  } catch {
    // optional stats
  }

  return applySecurityHeaders(
    NextResponse.json({
      ok: true,
      provider: "telegram",
      enabled: config.enabled,
      configured: config.configured,
      status: status.status,
      maskedToken: config.maskedToken || null,
      chatConfigured: Boolean(config.chatId),
      timeoutMs: config.timeoutMs,
      lastSuccess,
      lastFailure,
      failed24h,
    }),
  );
}
