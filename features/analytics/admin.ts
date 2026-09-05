import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { listAdminProjects } from "@/features/projects/admin";
import { getSecretSupabase } from "@/lib/supabase/server";
import type { EnquiryStatus } from "@/lib/supabase/database.types";

export type TrendPoint = { label: string; value: number };
export type Breakdown = { label: string; value: number };

export type ActivityItem = {
  id: number;
  action: string;
  label: string;
  entityType: string;
  entityId: string | null;
  at: string;
};

export type DashboardAnalytics = {
  enquiryTrend: TrendPoint[];
  enquiryTrendTotal: number;
  enquiryStatus: Breakdown[];
  projects: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    byStatus: Breakdown[];
    byCategory: Breakdown[];
  };
  activity: ActivityItem[];
};

const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  in_discussion: "In discussion",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
  spam: "Spam",
};

const ENQUIRY_STATUS_ORDER: EnquiryStatus[] = [
  "new",
  "contacted",
  "in_discussion",
  "qualified",
  "converted",
  "closed",
  "spam",
];

/** Friendly labels for audit actions like `project.published`. */
function humaniseAction(action: string): string {
  const [entity, verb] = action.split(".");
  const verbLabel = (verb ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const entityLabel = (entity ?? "").replace(/_/g, " ");
  if (!verb) return action;
  return `${verbLabel} ${entityLabel}`.trim();
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shortDayLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/**
 * Enquiries per day over the trailing `days` window, zero-filled so the chart
 * always shows a continuous axis.
 */
export async function getEnquiryTrend(days = 30): Promise<{ points: TrendPoint[]; total: number }> {
  await requireAdminSession();
  const empty = { points: [] as TrendPoint[], total: 0 };
  try {
    const supabase = getSecretSupabase();
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const { data, error } = await supabase
      .from("enquiries")
      .select("created_at")
      .gte("created_at", since.toISOString());

    if (error) return empty;

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const key = dayKey(new Date(row.created_at as string));
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const points: TrendPoint[] = [];
    let total = 0;
    for (let i = 0; i < days; i += 1) {
      const date = new Date(since);
      date.setDate(since.getDate() + i);
      const value = counts.get(dayKey(date)) ?? 0;
      total += value;
      points.push({ label: shortDayLabel(date), value });
    }
    return { points, total };
  } catch {
    return empty;
  }
}

/** Count of enquiries in each status, ordered as a pipeline. */
export async function getEnquiryStatusBreakdown(): Promise<Breakdown[]> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase.from("enquiries").select("status");
    if (error) return [];

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      const status = row.status as string;
      counts.set(status, (counts.get(status) ?? 0) + 1);
    }

    return ENQUIRY_STATUS_ORDER.filter((status) => (counts.get(status) ?? 0) > 0).map((status) => ({
      label: ENQUIRY_STATUS_LABELS[status],
      value: counts.get(status) ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Project counts by status and by category (works with static fallback). */
export async function getProjectAnalytics(): Promise<DashboardAnalytics["projects"]> {
  const projects = await listAdminProjects();

  const byStatusMap = new Map<string, number>();
  const byCategoryMap = new Map<string, number>();
  for (const project of projects) {
    byStatusMap.set(project.status, (byStatusMap.get(project.status) ?? 0) + 1);
    byCategoryMap.set(project.category, (byCategoryMap.get(project.category) ?? 0) + 1);
  }

  const statusLabel = (status: string) =>
    status.replace(/\b\w/g, (c) => c.toUpperCase());

  const byStatus: Breakdown[] = [...byStatusMap.entries()].map(([status, value]) => ({
    label: statusLabel(status),
    value,
  }));
  const byCategory: Breakdown[] = [...byCategoryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    total: projects.length,
    published: byStatusMap.get("published") ?? 0,
    draft: byStatusMap.get("draft") ?? 0,
    archived: byStatusMap.get("archived") ?? 0,
    byStatus,
    byCategory,
  };
}

/** Most recent admin mutations from the audit log. */
export async function getRecentActivity(limit = 8): Promise<ActivityItem[]> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("audit_events")
      .select("id, action, entity_type, entity_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];

    return (data ?? []).map((row) => ({
      id: row.id as number,
      action: row.action as string,
      label: humaniseAction(row.action as string),
      entityType: row.entity_type as string,
      entityId: (row.entity_id as string | null) ?? null,
      at: row.created_at as string,
    }));
  } catch {
    return [];
  }
}

/** Aggregate everything the dashboard charts need in one call. */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  await requireAdminSession();
  const [trend, enquiryStatus, projects, activity] = await Promise.all([
    getEnquiryTrend(30),
    getEnquiryStatusBreakdown(),
    getProjectAnalytics(),
    getRecentActivity(8),
  ]);

  return {
    enquiryTrend: trend.points,
    enquiryTrendTotal: trend.total,
    enquiryStatus,
    projects,
    activity,
  };
}
