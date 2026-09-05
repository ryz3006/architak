import "server-only";

import type { Testimonial } from "@/content/static";
import { createPublishableClient } from "@/lib/supabase/client";
import { getSecretSupabase } from "@/lib/supabase/server";
import { requireAdminSession } from "@/features/auth/session";

const FALLBACK_IMAGE = "/media/hero/experience-kitchen.jpg";

export type ProjectTestimonialInput = {
  quote: string;
  authorName: string;
  authorRole?: string;
  location?: string;
  isEnabled?: boolean;
  sortOrder?: number;
};

/** Public: enabled testimonials across published projects, mapped to Studio voices shape. */
export async function listEnabledProjectTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createPublishableClient();
    const { data, error } = await supabase
      .from("project_testimonials")
      .select("quote, author_name, author_role, location, sort_order, is_enabled")
      .eq("is_enabled", true)
      .order("sort_order", { ascending: true })
      .limit(12);

    if (error || !data?.length) return [];

    return data.map((row) => ({
      quote: row.quote,
      name: row.author_name,
      role: row.author_role ?? "Client",
      location: row.location ?? "Kochi",
      image: FALLBACK_IMAGE,
    }));
  } catch {
    return [];
  }
}

export async function listProjectTestimonialsAdmin(projectId: string) {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("project_testimonials")
      .select("id, quote, author_name, author_role, location, is_enabled, sort_order")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export async function replaceProjectTestimonials(
  projectId: string,
  items: ProjectTestimonialInput[],
): Promise<void> {
  const supabase = getSecretSupabase();
  await supabase.from("project_testimonials").delete().eq("project_id", projectId);

  const rows = items
    .filter((item) => item.quote.trim() && item.authorName.trim())
    .map((item, index) => ({
      project_id: projectId,
      quote: item.quote.trim().slice(0, 1000),
      author_name: item.authorName.trim().slice(0, 120),
      author_role: item.authorRole?.trim().slice(0, 120) || null,
      location: item.location?.trim().slice(0, 120) || null,
      is_enabled: item.isEnabled !== false,
      sort_order: item.sortOrder ?? index,
    }));

  if (rows.length > 0) {
    await supabase.from("project_testimonials").insert(rows);
  }
}
