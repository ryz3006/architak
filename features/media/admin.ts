import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";

export async function listAdminMedia() {
  await requireAdminSession();

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("media_assets")
      .select("id, storage_key, visibility, mime_type, alt_text, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}
