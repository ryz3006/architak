"use client";

import { useCallback, useEffect, useState } from "react";

type TelegramStatus = {
  enabled: boolean;
  configured: boolean;
  status: string;
  maskedToken: string | null;
  chatConfigured: boolean;
  timeoutMs: number;
  lastSuccess: string | null;
  lastFailure: string | null;
  failed24h: number;
};

export function TelegramSettings() {
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/telegram/status");
      const json = (await res.json()) as TelegramStatus & { ok: boolean };
      if (json.ok) setStatus(json);
    } catch {
      setMessage("Could not load Telegram status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function sendTest() {
    setTesting(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/notifications/telegram/test", { method: "POST" });
      const json = (await res.json()) as { ok: boolean; message: string };
      setMessage(json.message);
      await refresh();
    } catch {
      setMessage("Test request failed.");
    } finally {
      setTesting(false);
    }
  }

  const statusLabel =
    status?.status === "operational"
      ? "Operational"
      : status?.status === "disabled"
        ? "Disabled"
        : status?.status === "not_configured"
          ? "Not configured"
          : status?.status === "configured"
            ? "Configured"
            : loading
              ? "Loading…"
              : "Unknown";

  return (
    <section className="mt-12 border border-border p-5">
      <h2 className="display text-fluid-xl">Telegram notifications</h2>
      <p className="measure mt-2 text-fluid-sm text-muted">
        New enquiries can notify your studio chat. Configure credentials via environment variables
        — the bot token is never shown in full.
      </p>

      <dl className="mt-6 space-y-3 text-fluid-sm">
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Status</dt>
          <dd className="text-accent">{statusLabel}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Bot token</dt>
          <dd>{status?.maskedToken || "Not configured"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Chat ID</dt>
          <dd>{status?.chatConfigured ? "Configured" : "Not configured"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">New enquiries</dt>
          <dd>{status?.enabled ? "Enabled" : "Disabled"}</dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Last successful</dt>
          <dd>
            {status?.lastSuccess
              ? new Date(status.lastSuccess).toLocaleString("en-IN")
              : "None yet"}
          </dd>
        </div>
        <div className="flex flex-wrap justify-between gap-2">
          <dt className="text-muted">Failed (24h)</dt>
          <dd>{status?.failed24h ?? 0}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={() => void sendTest()}
        disabled={testing || !status?.configured || !status.enabled}
        className="mt-6 min-h-11 border border-foreground px-5 py-2 text-fluid-xs tracking-widest uppercase disabled:opacity-50"
      >
        {testing ? "Sending…" : "Send test notification"}
      </button>

      {message ? (
        <p role="status" className="mt-4 text-fluid-sm text-accent">
          {message}
        </p>
      ) : null}

      <p className="mt-6 text-fluid-xs text-muted">
        Set TELEGRAM_NOTIFICATIONS_ENABLED, TELEGRAM_BOT_TOKEN, and TELEGRAM_CHAT_ID in the server
        environment, then redeploy.
      </p>
    </section>
  );
}
