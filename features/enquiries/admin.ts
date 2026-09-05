import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";
import type { EnquiryStatus } from "@/lib/supabase/database.types";

export type AdminEnquiry = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string;
  status: EnquiryStatus;
  source_page: string | null;
  created_at: string;
  updated_at: string;
};

export type EnquiryFilters = {
  search?: string;
  status?: EnquiryStatus | "all";
  source?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "oldest" | "name" | "status";
};

export type EnquiryEvent = {
  id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  note: string | null;
  created_at: string;
  metadata: unknown;
};

const STATUS_VALUES: EnquiryStatus[] = [
  "new",
  "contacted",
  "in_discussion",
  "qualified",
  "converted",
  "closed",
  "spam",
];

export async function listAdminEnquiries(filters: EnquiryFilters = {}): Promise<{
  items: AdminEnquiry[];
  total: number;
  page: number;
  pageSize: number;
}> {
  await requireAdminSession();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(10, filters.pageSize ?? 25));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const supabase = getSecretSupabase();
    let query = supabase
      .from("enquiries")
      .select("id, name, email, phone, message, status, source_page, created_at, updated_at", {
        count: "exact",
      });

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }
    if (filters.source) {
      query = query.ilike("source_page", `${filters.source}%`);
    }
    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }
    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }
    if (filters.search?.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,message.ilike.%${q}%,id.eq.${q}`,
      );
    }

    const ascending = filters.sort === "oldest";
    if (filters.sort === "name") {
      query = query.order("name", { ascending: true });
    } else if (filters.sort === "status") {
      query = query.order("status", { ascending: true });
    } else {
      query = query.order("created_at", { ascending });
    }

    const { data, error, count } = await query.range(from, to);
    if (error) return { items: [], total: 0, page, pageSize };
    return { items: (data ?? []) as AdminEnquiry[], total: count ?? 0, page, pageSize };
  } catch {
    return { items: [], total: 0, page, pageSize };
  }
}

export async function getAdminEnquiry(id: string): Promise<{
  enquiry: AdminEnquiry | null;
  events: EnquiryEvent[];
}> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const [{ data: enquiry }, { data: events }] = await Promise.all([
      supabase
        .from("enquiries")
        .select("id, name, email, phone, message, status, source_page, created_at, updated_at")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("enquiry_events")
        .select("id, event_type, from_status, to_status, note, created_at, metadata")
        .eq("enquiry_id", id)
        .order("created_at", { ascending: true }),
    ]);
    return {
      enquiry: (enquiry as AdminEnquiry | null) ?? null,
      events: (events as EnquiryEvent[]) ?? [],
    };
  } catch {
    return { enquiry: null, events: [] };
  }
}

export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus,
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  if (!STATUS_VALUES.includes(status)) {
    return { ok: false, message: "Invalid status." };
  }

  try {
    const supabase = getSecretSupabase();
    const { data: current } = await supabase
      .from("enquiries")
      .select("status")
      .eq("id", id)
      .maybeSingle();

    if (!current) return { ok: false, message: "Enquiry not found." };
    if (current.status === status) return { ok: true, message: "Status unchanged." };

    const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
    if (error) return { ok: false, message: "Could not update status." };

    await supabase.from("enquiry_events").insert({
      enquiry_id: id,
      event_type: "status_changed",
      from_status: current.status,
      to_status: status,
    });

    await supabase.from("audit_events").insert({
      action: "enquiry.status_changed",
      entity_type: "enquiries",
      entity_id: id,
      before_data: { status: current.status },
      after_data: { status },
    });

    return { ok: true, message: "Status updated." };
  } catch {
    return { ok: false, message: "Could not update status." };
  }
}

export async function addEnquiryNote(
  id: string,
  note: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  const trimmed = note.trim();
  if (!trimmed || trimmed.length > 5000) {
    return { ok: false, message: "Note must be between 1 and 5000 characters." };
  }

  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase.from("enquiry_events").insert({
      enquiry_id: id,
      event_type: "note_added",
      note: trimmed,
    });
    if (error) return { ok: false, message: "Could not add note." };
    return { ok: true, message: "Note added." };
  } catch {
    return { ok: false, message: "Could not add note." };
  }
}

export async function getEnquiryMetrics(): Promise<{
  newCount: number;
  today: number;
  week: number;
  month: number;
  open: number;
  converted: number;
}> {
  await requireAdminSession();
  const empty = { newCount: 0, today: 0, week: 0, month: 0, open: 0, converted: 0 };
  try {
    const supabase = getSecretSupabase();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [{ count: newCount }, { count: today }, { count: week }, { count: month }, { data: all }] =
      await Promise.all([
        supabase.from("enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
        supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("enquiries")
          .select("*", { count: "exact", head: true })
          .gte("created_at", monthAgo.toISOString()),
        supabase.from("enquiries").select("status"),
      ]);

    const rows = all ?? [];
    const open = rows.filter((r) =>
      ["new", "contacted", "in_discussion", "qualified"].includes(r.status),
    ).length;
    const converted = rows.filter((r) => r.status === "converted" || r.status === "qualified").length;

    return {
      newCount: newCount ?? 0,
      today: today ?? 0,
      week: week ?? 0,
      month: month ?? 0,
      open,
      converted,
    };
  } catch {
    return empty;
  }
}

export function projectSlugFromSource(sourcePage: string | null): string | null {
  if (!sourcePage) return null;
  const match = sourcePage.match(/^\/work\/([a-z0-9-]+)/);
  return match?.[1] ?? null;
}
