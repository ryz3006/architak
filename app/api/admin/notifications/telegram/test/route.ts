import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { getTelegramProvider } from "@/features/notifications/providers/telegram";
import { getSecretSupabase } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { applySecurityHeaders } from "@/lib/security/headers";
import { headers } from "next/headers";

export async function POST() {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(`telegram-test:${ip}`, 3, 60_000);
  if (!limit.ok) {
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false, message: "Too many test notifications. Try again shortly." },
        { status: 429 },
      ),
    );
  }

  const provider = getTelegramProvider();
  const result = await provider.test();

  try {
    const supabase = getSecretSupabase();
    await supabase.from("audit_events").insert({
      action: "telegram.test_notification",
      entity_type: "integrations",
      after_data: {
        ok: result.ok,
        durationMs: result.durationMs,
        errorCategory: result.errorCategory ?? null,
      },
    });
  } catch {
    // audit is best-effort
  }

  console.info(
    JSON.stringify({
      event: result.ok ? "telegram_test_notification_sent" : "telegram_notification_failed",
      provider: "telegram",
      durationMs: result.durationMs,
      status: result.ok ? "sent" : "failed",
    }),
  );

  return applySecurityHeaders(
    NextResponse.json({
      ok: result.ok,
      message: result.ok
        ? "Test notification sent. Check your Telegram chat."
        : result.error || "Test notification failed.",
      durationMs: result.durationMs,
    }),
  );
}
