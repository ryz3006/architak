import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";

export async function listAdminEnquiries() {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("enquiries")
      .select("id, name, email, phone, message, status, source_page, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
