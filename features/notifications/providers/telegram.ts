import "server-only";

import { getTelegramConfig } from "@/features/notifications/config";
import type {
  NotificationPayload,
  NotificationProvider,
  NotificationResult,
  ProviderStatus,
} from "@/features/notifications/types";

const RETRY_DELAYS_MS = [200, 1000, 3000] as const;

function classifyHttpStatus(status: number): NotificationResult["errorCategory"] {
  if (status === 401 || status === 403) return "auth";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "api";
  if (status >= 400) return "api";
  return "unknown";
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendTelegramMessage(
  text: string,
): Promise<NotificationResult> {
  const config = getTelegramConfig();
  const started = Date.now();

  if (!config.enabled) {
    return {
      ok: false,
      error: "Telegram notifications are disabled.",
      errorCategory: "config",
      durationMs: Date.now() - started,
    };
  }
  if (!config.configured) {
    return {
      ok: false,
      error: "Telegram bot token or chat ID is missing.",
      errorCategory: "config",
      durationMs: Date.now() - started,
    };
  }

  const url = `https://api.telegram.org/bot${config.token}/sendMessage`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.chatId,
        text,
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const durationMs = Date.now() - started;

    let json: { ok?: boolean; result?: { message_id?: number }; description?: string } = {};
    try {
      json = (await response.json()) as typeof json;
    } catch {
      return {
        ok: false,
        error: "Malformed Telegram response.",
        errorCategory: "api",
        durationMs,
      };
    }

    if (!response.ok || !json.ok) {
      return {
        ok: false,
        error: json.description || `Telegram HTTP ${response.status}`,
        errorCategory: classifyHttpStatus(response.status),
        durationMs,
      };
    }

    return {
      ok: true,
      providerMessageId: json.result?.message_id ? String(json.result.message_id) : undefined,
      durationMs,
    };
  } catch (error) {
    clearTimeout(timer);
    const durationMs = Date.now() - started;
    const name = error instanceof Error ? error.name : "Error";
    if (name === "AbortError") {
      return {
        ok: false,
        error: `Request timed out after ${config.timeoutMs}ms`,
        errorCategory: "timeout",
        durationMs,
      };
    }
    return {
      ok: false,
      error: "Network failure contacting Telegram.",
      errorCategory: "network",
      durationMs,
    };
  }
}

async function sendWithRetries(text: string): Promise<NotificationResult> {
  let last: NotificationResult = {
    ok: false,
    error: "No attempts",
    errorCategory: "unknown",
    durationMs: 0,
  };

  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    last = await sendTelegramMessage(text);
    if (last.ok) return last;
    if (last.errorCategory === "config" || last.errorCategory === "auth") return last;
    if (attempt < RETRY_DELAYS_MS.length - 1) {
      await sleep(RETRY_DELAYS_MS[attempt]!);
    }
  }

  return last;
}

export class TelegramNotificationProvider implements NotificationProvider {
  readonly name = "telegram";

  getStatus(): ProviderStatus {
    const config = getTelegramConfig();
    if (!config.enabled) {
      return { enabled: false, configured: config.configured, status: "disabled" };
    }
    if (!config.configured) {
      return { enabled: true, configured: false, status: "not_configured" };
    }
    return { enabled: true, configured: true, status: "operational" };
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    return sendWithRetries(payload.body);
  }

  async test(): Promise<NotificationResult> {
    const { getSiteUrl } = await import("@/features/discovery");
    const { formatTelegramTestMessage } = await import(
      "@/features/notifications/formatters/enquiry"
    );
    return sendWithRetries(formatTelegramTestMessage(getSiteUrl()));
  }
}

export function getTelegramProvider(): TelegramNotificationProvider {
  return new TelegramNotificationProvider();
}
