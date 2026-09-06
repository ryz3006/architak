import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import {
  estimatePageViewsBytes,
  TRAFFIC_MAX_BYTES,
  TRAFFIC_RETENTION_DAYS,
} from "@/features/analytics/collect";
import { getSecretSupabase } from "@/lib/supabase/server";
import type { Breakdown, TrendPoint } from "@/features/analytics/admin";
import { formatBytes } from "@/features/media/capabilities";

export type TrafficVisit = {
  id: number;
  at: string;
  path: string;
  country: string | null;
  region: string | null;
  city: string | null;
  browser: string | null;
  device: string | null;
  referrerHost: string | null;
};

export type TrafficAnalytics = {
  totalViews: number;
  uniqueVisitors: number;
  viewsToday: number;
  trend: TrendPoint[];
  byCountry: Breakdown[];
  byBrowser: Breakdown[];
  byDevice: Breakdown[];
  byHour: Breakdown[];
  byPath: Breakdown[];
  recent: TrafficVisit[];
  retention: {
    days: number;
    maxBytes: number;
    usedBytes: number;
    usedLabel: string;
    maxLabel: string;
    percentUsed: number;
  };
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDayLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function countryLabel(code: string | null): string {
  if (!code) return "Unknown";
  try {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function topCounts(
  rows: Array<string | null | undefined>,
  limit = 8,
  labelFn: (value: string) => string = (v) => v,
): Breakdown[] {
  const counts = new Map<string, number>();
  for (const raw of rows) {
    const key = (raw && raw.trim()) || "Unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([key, value]) => ({ label: labelFn(key), value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Aggregated website traffic for the admin dashboard (last 30 days). */
export async function getTrafficAnalytics(days = TRAFFIC_RETENTION_DAYS): Promise<TrafficAnalytics> {
  await requireAdminSession();

  const empty: TrafficAnalytics = {
    totalViews: 0,
    uniqueVisitors: 0,
    viewsToday: 0,
    trend: [],
    byCountry: [],
    byBrowser: [],
    byDevice: [],
    byHour: [],
    byPath: [],
    recent: [],
    retention: {
      days: TRAFFIC_RETENTION_DAYS,
      maxBytes: TRAFFIC_MAX_BYTES,
      usedBytes: 0,
      usedLabel: formatBytes(0),
      maxLabel: formatBytes(TRAFFIC_MAX_BYTES),
      percentUsed: 0,
    },
  };

  try {
    const supabase = getSecretSupabase();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ data, error }, usedBytes] = await Promise.all([
      supabase
        .from("page_views")
        .select(
          "id, occurred_at, path, country, region, city, browser, device, referrer_host, visitor_id",
        )
        .gte("occurred_at", since.toISOString())
        .order("occurred_at", { ascending: false })
        .limit(5000),
      estimatePageViewsBytes(),
    ]);

    if (error || !data) {
      return {
        ...empty,
        retention: {
          ...empty.retention,
          usedBytes,
          usedLabel: formatBytes(usedBytes),
          percentUsed: Math.min(100, Math.round((usedBytes / TRAFFIC_MAX_BYTES) * 100)),
        },
      };
    }

    const dayCounts = new Map<string, number>();
    const hourCounts = new Map<number, number>();
    const visitors = new Set<string>();
    let viewsToday = 0;

    for (const row of data) {
      const at = new Date(row.occurred_at as string);
      dayCounts.set(dayKey(at), (dayCounts.get(dayKey(at)) ?? 0) + 1);
      hourCounts.set(at.getHours(), (hourCounts.get(at.getHours()) ?? 0) + 1);
      if (row.visitor_id) visitors.add(row.visitor_id as string);
      if (at >= todayStart) viewsToday += 1;
    }

    const trend: TrendPoint[] = [];
    for (let i = 0; i < days; i += 1) {
      const date = new Date(since);
      date.setDate(since.getDate() + i);
      trend.push({
        label: shortDayLabel(date),
        value: dayCounts.get(dayKey(date)) ?? 0,
      });
    }

    const byHour: Breakdown[] = Array.from({ length: 24 }, (_, hour) => ({
      label: `${String(hour).padStart(2, "0")}:00`,
      value: hourCounts.get(hour) ?? 0,
    }));

    const recent: TrafficVisit[] = data.slice(0, 25).map((row) => ({
      id: row.id as number,
      at: row.occurred_at as string,
      path: row.path as string,
      country: (row.country as string | null) ?? null,
      region: (row.region as string | null) ?? null,
      city: (row.city as string | null) ?? null,
      browser: (row.browser as string | null) ?? null,
      device: (row.device as string | null) ?? null,
      referrerHost: (row.referrer_host as string | null) ?? null,
    }));

    return {
      totalViews: data.length,
      uniqueVisitors: visitors.size,
      viewsToday,
      trend,
      byCountry: topCounts(
        data.map((row) => row.country as string | null),
        8,
        (code) => countryLabel(code === "Unknown" ? null : code),
      ),
      byBrowser: topCounts(data.map((row) => row.browser as string | null)),
      byDevice: topCounts(data.map((row) => row.device as string | null)),
      byHour,
      byPath: topCounts(data.map((row) => row.path as string), 8),
      recent,
      retention: {
        days: TRAFFIC_RETENTION_DAYS,
        maxBytes: TRAFFIC_MAX_BYTES,
        usedBytes,
        usedLabel: formatBytes(usedBytes),
        maxLabel: formatBytes(TRAFFIC_MAX_BYTES),
        percentUsed: Math.min(100, Math.round((usedBytes / TRAFFIC_MAX_BYTES) * 100)),
      },
    };
  } catch {
    return empty;
  }
}
