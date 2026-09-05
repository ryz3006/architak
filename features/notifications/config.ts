import "server-only";

import { getServerEnv } from "@/lib/env";

export function getTelegramConfig() {
  const env = getServerEnv();
  const enabled = Boolean(env.TELEGRAM_NOTIFICATIONS_ENABLED);
  const token = env.TELEGRAM_BOT_TOKEN.trim();
  const chatId = env.TELEGRAM_CHAT_ID.trim();
  const timeoutMs = env.TELEGRAM_NOTIFICATION_TIMEOUT_MS;
  const configured = Boolean(token && chatId);

  return {
    enabled,
    configured,
    token,
    chatId,
    timeoutMs,
    maskedToken: token ? `••••••••••••${token.slice(-4)}` : "",
  };
}
