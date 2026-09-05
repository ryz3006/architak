/**
 * Plain-text enquiry notification for Telegram.
 * No Markdown/HTML — avoids injection from customer content.
 */

const MAX_MESSAGE_CHARS = 500;
const TELEGRAM_MAX = 4000;

function sanitize(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

function truncate(value: string, max: number): { text: string; truncated: boolean } {
  if (value.length <= max) return { text: value, truncated: false };
  return { text: value.slice(0, max - 1).trimEnd() + "…", truncated: true };
}

export type EnquiryNotifyInput = {
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  sourcePage: string | null;
  status?: string;
  projectTitle?: string | null;
  receivedAt?: Date;
  adminUrl?: string;
};

export function formatEnquiryTelegramMessage(input: EnquiryNotifyInput): string {
  const received = input.receivedAt ?? new Date();
  const receivedLabel = received.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const messageResult = truncate(sanitize(input.message), MAX_MESSAGE_CHARS);

  const lines = [
    "🔔 NEW WEBSITE ENQUIRY",
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    "👤 Name",
    sanitize(input.name) || "Not provided",
    "",
    "📱 Phone",
    sanitize(input.phone || "") || "Not provided",
    "",
    "✉️ Email",
    sanitize(input.email || "") || "Not provided",
    "",
    "🏠 Project",
    sanitize(input.projectTitle || "") || "Not specified",
    "",
    "📍 Source",
    sanitize(input.sourcePage || "") || "Not specified",
    "",
    "🕐 Received",
    receivedLabel,
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    "💬 Message",
    messageResult.text,
    messageResult.truncated ? "" : null,
    messageResult.truncated ? "[Message truncated]" : null,
    "",
    "━━━━━━━━━━━━━━━━",
    "",
    `🟢 Status: ${(input.status || "NEW").toUpperCase()}`,
  ].filter((line): line is string => line !== null);

  if (input.adminUrl) {
    lines.push("", "🔗 Open Enquiry", input.adminUrl);
  }

  let body = lines.join("\n");
  if (body.length > TELEGRAM_MAX) {
    body = body.slice(0, TELEGRAM_MAX - 20) + "\n\n[Message truncated]";
  }
  return body;
}

export function formatTelegramTestMessage(siteUrl: string): string {
  return [
    "✅ Telegram Integration Test",
    "",
    "Your website enquiry notification integration is working correctly.",
    "",
    "Sent from:",
    siteUrl,
    "",
    "Time:",
    new Date().toLocaleString("en-IN", { timeZoneName: "short" }),
  ].join("\n");
}
