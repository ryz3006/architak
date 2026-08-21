import "server-only";

import { createPublishableClient, createSecretClient } from "@/lib/supabase/client";

export function getPublishableSupabase() {
  return createPublishableClient();
}

/**
 * Prefer `requireAdminSession` from features/auth before calling this.
 */
export function getSecretSupabase() {
  return createSecretClient();
}
