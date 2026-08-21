import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getPublicEnv, getServerEnv } from "@/lib/env";

/**
 * Browser / public Server Component client.
 * Uses the publishable key — Row Level Security is enforced.
 */
export function createPublishableClient(): SupabaseClient {
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = getPublicEnv();

  return createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-only client with the secret (service role) key.
 * Bypasses RLS — call ONLY after admin session (or later Auth) is verified.
 * Never import this into Client Components.
 */
export function createSecretClient(): SupabaseClient {
  const env = getServerEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
