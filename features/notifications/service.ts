import "server-only";

import { getAdminBasePath, getServerEnv } from "@/lib/env";
import { getSecretSupabase } from "@/lib/supabase/server";
import { getTelegramProvider } from "@/features/notifications/providers/telegram";
import { formatEnquiryTelegramMessage } from "@/features/notifications/formatters/enquiry";
import { getTelegramConfig } from "@/features/notifications/config";
import { projectSlugFromSource } from "@/features/enquiries/admin";

export type EnquiryNotifyDraft = {
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  sourcePage: string;
};

/**
 * Runs after the customer response is sent (via next/server after()).
 * Never throws to the caller — all failures are logged/recorded.
 */
export async function processEnquiryNotification(draft: EnquiryNotifyDraft): Promise<void> {
  const config = getTelegramConfig();
  if (!config.enabled || !config.configured) {
    console.info(
      JSON.stringify({
        event: "telegram_notification_skipped",
        reason: !config.enabled ? "disabled" : "not_configured",
      }),
    );
    return;
  }

  try {
    const supabase = getSecretSupabase();
    const { data: enquiry } = await supabase
      .from("enquiries")
      .select("id, name, email, phone, message, source_page, status, created_at")
      .eq("name", draft.name)
      .eq("message", draft.message)
      .eq("source_page", draft.sourcePage)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!enquiry) {
      console.info(JSON.stringify({ event: "telegram_notification_failed", reason: "enquiry_not_found" }));
      return;
    }

    const { data: sentEvents } = await supabase
      .from("enquiry_events")
      .select("id, metadata")
      .eq("enquiry_id", enquiry.id)
      .eq("event_type", "notification_sent");

    const alreadySent = (sentEvents ?? []).some((event) => {
      const meta = event.metadata;
      return (
        meta &&
        typeof meta === "object" &&
        !Array.isArray(meta) &&
        (meta as { provider?: string }).provider === "telegram"
      );
    });

    if (alreadySent) {
      console.info(
        JSON.stringify({
          event: "telegram_notification_skipped",
          reason: "already_sent",
          enquiryId: enquiry.id,
        }),
      );
      return;
    }

    await supabase.from("enquiry_events").insert({
      enquiry_id: enquiry.id,
      event_type: "notification_queued",
      metadata: { provider: "telegram" },
    });

    console.info(
      JSON.stringify({
        event: "telegram_notification_started",
        enquiryId: enquiry.id,
        provider: "telegram",
        notificationType: "new_enquiry",
      }),
    );

    const siteUrl = getServerEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
    const adminPath = getAdminBasePath();
    const projectSlug = projectSlugFromSource(enquiry.source_page);

    const body = formatEnquiryTelegramMessage({
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone,
      message: enquiry.message,
      sourcePage: enquiry.source_page,
      status: enquiry.status,
      projectTitle: projectSlug,
      receivedAt: new Date(enquiry.created_at),
      adminUrl: `${siteUrl}${adminPath}/enquiries/${enquiry.id}`,
    });

    const provider = getTelegramProvider();
    const result = await provider.send({
      type: "new_enquiry",
      enquiryId: enquiry.id,
      title: "New enquiry",
      body,
      url: `${siteUrl}${adminPath}/enquiries/${enquiry.id}`,
    });

    if (result.ok) {
      await supabase.from("enquiry_events").insert({
        enquiry_id: enquiry.id,
        event_type: "notification_sent",
        metadata: {
          provider: "telegram",
          provider_message_id: result.providerMessageId ?? null,
          duration_ms: result.durationMs,
        },
      });
      console.info(
        JSON.stringify({
          event: "telegram_notification_sent",
          enquiryId: enquiry.id,
          provider: "telegram",
          durationMs: result.durationMs,
          status: "sent",
        }),
      );
    } else {
      await supabase.from("enquiry_events").insert({
        enquiry_id: enquiry.id,
        event_type: "notification_failed",
        metadata: {
          provider: "telegram",
          error_category: result.errorCategory ?? "unknown",
          error_message: result.error ?? "Unknown error",
          duration_ms: result.durationMs,
        },
      });
      console.info(
        JSON.stringify({
          event: "telegram_notification_failed",
          enquiryId: enquiry.id,
          provider: "telegram",
          durationMs: result.durationMs,
          status: "failed",
          errorCategory: result.errorCategory,
        }),
      );
    }
  } catch (error) {
    console.info(
      JSON.stringify({
        event: "telegram_notification_failed",
        reason: "unexpected",
        errorName: error instanceof Error ? error.name : "unknown",
      }),
    );
  }
}
