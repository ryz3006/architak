import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getStorageUsage } from "@/features/media/storage-accounting";
import { getTelegramProvider } from "@/features/notifications/providers/telegram";
import { getPublishableSupabase, getSecretSupabase } from "@/lib/supabase/server";
import { isR2Configured } from "@/lib/env";
import { getStorageService } from "@/lib/storage/r2";

export type HealthCheck = {
  id: string;
  label: string;
  businessStatus: string;
  ok: boolean;
  latencyMs: number | null;
  detail: string;
  lastCheckedAt: string;
};

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: true; value: T; ms: number } | { ok: false; ms: number; error: string }> {
  const start = Date.now();
  try {
    const value = await fn();
    return { ok: true, value, ms: Date.now() - start };
  } catch (error) {
    return {
      ok: false,
      ms: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function runSystemHealthChecks(): Promise<{
  checks: HealthCheck[];
  overall: "healthy" | "degraded" | "down";
  overallLabel: string;
}> {
  await requireAdminSession();
  const now = new Date().toISOString();
  const checks: HealthCheck[] = [];

  const website = await timed(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000"}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
  checks.push({
    id: "website",
    label: "Website",
    businessStatus: website.ok ? "Running smoothly" : "Temporarily unavailable",
    ok: website.ok,
    latencyMs: website.ms,
    detail: website.ok ? `API health OK (${website.ms}ms)` : website.error,
    lastCheckedAt: now,
  });

  const db = await timed(async () => {
    const supabase = getPublishableSupabase();
    const { error } = await supabase.from("projects").select("id").limit(1);
    if (error) throw new Error(error.message);
    return true;
  });
  checks.push({
    id: "database",
    label: "Content system",
    businessStatus: db.ok ? "Running normally" : "Content system unavailable",
    ok: db.ok,
    latencyMs: db.ms,
    detail: db.ok ? `Database reachable (${db.ms}ms)` : db.error,
    lastCheckedAt: now,
  });

  const storage = await timed(async () => {
    if (!isR2Configured()) throw new Error("R2 not configured");
    // Lightweight check: build a public URL for a known prefix
    const url = getStorageService().getPublicUrl("public/.keep");
    if (!url) throw new Error("Public CDN base URL missing");
    return true;
  });
  checks.push({
    id: "storage",
    label: "Media",
    businessStatus: storage.ok ? "Available" : "Media storage unavailable",
    ok: storage.ok,
    latencyMs: storage.ms,
    detail: storage.ok ? `R2 configured (${storage.ms}ms)` : storage.error,
    lastCheckedAt: now,
  });

  const telegram = getTelegramProvider().getStatus();
  checks.push({
    id: "telegram",
    label: "Telegram notifications",
    businessStatus:
      telegram.status === "operational"
        ? "Operational"
        : telegram.status === "disabled"
          ? "Disabled"
          : telegram.status === "not_configured"
            ? "Not configured"
            : "Check configuration",
    ok: telegram.status === "operational" || telegram.status === "disabled",
    latencyMs: null,
    detail: `enabled=${telegram.enabled}, configured=${telegram.configured}`,
    lastCheckedAt: now,
  });

  const usage = await getStorageUsage();
  checks.push({
    id: "quota",
    label: "Content storage",
    businessStatus:
      usage.state === "healthy"
        ? "Healthy"
        : usage.state === "warning"
          ? "Almost full"
          : "Full",
    ok: usage.state !== "full",
    latencyMs: null,
    detail: `${usage.formatted.total} / ${usage.formatted.max} (${usage.percentUsed}%)`,
    lastCheckedAt: now,
  });

  // Secret client ping for admin backend
  const backend = await timed(async () => {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("audit_events").select("id").limit(1);
    if (error) throw new Error(error.message);
    return true;
  });
  checks.push({
    id: "backend",
    label: "Backend",
    businessStatus: backend.ok ? "Healthy" : "Backend issue",
    ok: backend.ok,
    latencyMs: backend.ms,
    detail: backend.ok ? `Admin DB access OK (${backend.ms}ms)` : backend.error,
    lastCheckedAt: now,
  });

  const criticalDown = checks.filter((c) => ["website", "database", "backend"].includes(c.id) && !c.ok);
  const anyDown = checks.some((c) => !c.ok);
  const overall = criticalDown.length > 0 ? "down" : anyDown ? "degraded" : "healthy";
  const overallLabel =
    overall === "healthy"
      ? "Running smoothly"
      : overall === "degraded"
        ? "Needs attention"
        : "Service disruption";

  return { checks, overall, overallLabel };
}
