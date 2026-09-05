import "server-only";

import { getSecretSupabase } from "@/lib/supabase/server";

/**
 * Session revocation via a monotonically increasing epoch stored in
 * `site_settings`. Every issued token embeds the epoch it was minted under;
 * bumping the epoch ("sign out everywhere") invalidates all older tokens.
 *
 * Cached briefly in-memory to avoid a DB read on every admin request.
 */
const EPOCH_KEY = "security.session_epoch";
const CACHE_TTL_MS = 30_000;

let cache: { value: number; at: number } | null = null;

function coerceEpoch(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "epoch" in value) {
    const inner = (value as { epoch: unknown }).epoch;
    if (typeof inner === "number") return inner;
  }
  return 0;
}

export async function getSessionEpoch(): Promise<number> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.value;
  try {
    const supabase = getSecretSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", EPOCH_KEY)
      .maybeSingle();
    const value = coerceEpoch(data?.value);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return cache?.value ?? 0;
  }
}

/** Increment the epoch, invalidating all existing sessions. */
export async function bumpSessionEpoch(): Promise<number> {
  const current = await getSessionEpoch();
  const next = current + 1;
  try {
    const supabase = getSecretSupabase();
    await supabase.from("site_settings").upsert({
      key: EPOCH_KEY,
      value: next as never,
      description: "Admin session revocation epoch",
    });
    cache = { value: next, at: Date.now() };
  } catch {
    // If persistence fails the epoch is unchanged; caller surfaces the error.
    throw new Error("Could not revoke sessions.");
  }
  return next;
}
