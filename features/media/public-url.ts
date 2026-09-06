import { getStorageService } from "@/lib/storage/r2";

/**
 * Resolve a browser-usable URL for a public media asset.
 *
 * Seeded “legacy” keys (`public/legacy/...`) were registered in the database
 * before the bytes were uploaded to R2. Those files live under `/media/...` in
 * the Next.js public folder, so we rewrite them to the local path. Real R2
 * uploads keep the CDN URL from `R2_PUBLIC_BASE_URL`.
 */
export function resolvePublicMediaUrl(
  storageKey: string,
  metadata?: Record<string, unknown> | null,
): string | null {
  if (!storageKey.startsWith("public/")) return null;

  const seedSource = metadata && typeof metadata.seedSource === "string" ? metadata.seedSource : null;
  if (seedSource?.startsWith("/")) {
    return seedSource;
  }

  const legacyMatch = storageKey.match(/^public\/legacy\/(.+)$/);
  if (legacyMatch?.[1]) {
    return `/media/${legacyMatch[1]}`;
  }

  try {
    return getStorageService().getPublicUrl(storageKey);
  } catch {
    return null;
  }
}
