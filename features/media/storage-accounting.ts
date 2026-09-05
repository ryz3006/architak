import "server-only";

import {
  formatBytes,
  MAX_STORAGE_BYTES,
  storageHealthState,
  storagePercentUsed,
  WARNING_STORAGE_BYTES,
  type StorageHealthState,
} from "@/features/media/capabilities";
import { requireAdminSession } from "@/features/auth/session";
import { getSecretSupabase } from "@/lib/supabase/server";

export type StorageUsage = {
  totalBytes: number;
  imageBytes: number;
  videoBytes: number;
  assetCount: number;
  remainingBytes: number;
  percentUsed: number;
  state: StorageHealthState;
  maxBytes: number;
  warningBytes: number;
  lastCalculatedAt: string;
  formatted: {
    total: string;
    remaining: string;
    max: string;
    image: string;
    video: string;
  };
};

/**
 * Authoritative storage usage from media_assets.byte_size.
 * Call only after admin session verification (or from trusted server contexts that already verified).
 */
export async function getStorageUsage(options?: { skipAuth?: boolean }): Promise<StorageUsage> {
  if (!options?.skipAuth) {
    await requireAdminSession();
  }

  const empty: StorageUsage = {
    totalBytes: 0,
    imageBytes: 0,
    videoBytes: 0,
    assetCount: 0,
    remainingBytes: MAX_STORAGE_BYTES,
    percentUsed: 0,
    state: "healthy",
    maxBytes: MAX_STORAGE_BYTES,
    warningBytes: WARNING_STORAGE_BYTES,
    lastCalculatedAt: new Date().toISOString(),
    formatted: {
      total: formatBytes(0),
      remaining: formatBytes(MAX_STORAGE_BYTES),
      max: formatBytes(MAX_STORAGE_BYTES),
      image: formatBytes(0),
      video: formatBytes(0),
    },
  };

  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("media_assets")
      .select("byte_size, mime_type");

    if (error || !data) return empty;

    let totalBytes = 0;
    let imageBytes = 0;
    let videoBytes = 0;

    for (const row of data) {
      const size = Number(row.byte_size) || 0;
      totalBytes += size;
      if (typeof row.mime_type === "string" && row.mime_type.startsWith("video/")) {
        videoBytes += size;
      } else {
        imageBytes += size;
      }
    }

    const remainingBytes = Math.max(0, MAX_STORAGE_BYTES - totalBytes);
    const state = storageHealthState(totalBytes);
    const percentUsed = storagePercentUsed(totalBytes);

    return {
      totalBytes,
      imageBytes,
      videoBytes,
      assetCount: data.length,
      remainingBytes,
      percentUsed,
      state,
      maxBytes: MAX_STORAGE_BYTES,
      warningBytes: WARNING_STORAGE_BYTES,
      lastCalculatedAt: new Date().toISOString(),
      formatted: {
        total: formatBytes(totalBytes),
        remaining: formatBytes(remainingBytes),
        max: formatBytes(MAX_STORAGE_BYTES),
        image: formatBytes(imageBytes),
        video: formatBytes(videoBytes),
      },
    };
  } catch {
    return empty;
  }
}

export async function assertUploadFitsQuota(incomingBytes: number): Promise<
  { ok: true; usage: StorageUsage } | { ok: false; message: string; usage: StorageUsage }
> {
  const usage = await getStorageUsage();
  if (usage.totalBytes + incomingBytes > MAX_STORAGE_BYTES) {
    return {
      ok: false,
      message:
        "Upload unavailable. This file would exceed the 7 GB storage limit. Please remove unused content and try again.",
      usage,
    };
  }
  return { ok: true, usage };
}
