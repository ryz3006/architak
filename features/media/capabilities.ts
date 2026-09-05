/**
 * Single source of truth for media formats, size limits, and storage quota.
 * Used by gallery, upload validation, project editor, and website management.
 */

export const MAX_STORAGE_BYTES = 7 * 1024 * 1024 * 1024; // 7 GB
export const WARNING_STORAGE_BYTES = 6 * 1024 * 1024 * 1024; // 6 GB

export const MAX_IMAGE_BYTES = 25 * 1024 * 1024; // 25 MB per image
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB per video

export type MediaKind = "image" | "video";

export type MediaFormat = {
  extension: string;
  mimeTypes: readonly string[];
  kind: MediaKind;
  /** Legacy formats accepted but discouraged for new uploads */
  legacy?: boolean;
};

export const MEDIA_FORMATS: readonly MediaFormat[] = [
  { extension: "jpg", mimeTypes: ["image/jpeg"], kind: "image" },
  { extension: "jpeg", mimeTypes: ["image/jpeg"], kind: "image" },
  { extension: "png", mimeTypes: ["image/png"], kind: "image" },
  { extension: "webp", mimeTypes: ["image/webp"], kind: "image" },
  { extension: "avif", mimeTypes: ["image/avif"], kind: "image" },
  { extension: "svg", mimeTypes: ["image/svg+xml"], kind: "image" },
  { extension: "mp4", mimeTypes: ["video/mp4"], kind: "video" },
  { extension: "webm", mimeTypes: ["video/webm"], kind: "video" },
  {
    extension: "mov",
    mimeTypes: ["video/quicktime"],
    kind: "video",
    legacy: true,
  },
] as const;

export const SUPPORTED_IMAGE_EXTENSIONS = MEDIA_FORMATS.filter((f) => f.kind === "image").map(
  (f) => f.extension,
);

export const SUPPORTED_VIDEO_EXTENSIONS = MEDIA_FORMATS.filter(
  (f) => f.kind === "video" && !f.legacy,
).map((f) => f.extension);

export const ALL_ACCEPTED_EXTENSIONS = MEDIA_FORMATS.map((f) => f.extension);

export const ACCEPT_ATTR = MEDIA_FORMATS.map((f) => `.${f.extension}`).join(",");

export function getFormatByExtension(ext: string): MediaFormat | undefined {
  const normalized = ext.replace(/^\./, "").toLowerCase();
  return MEDIA_FORMATS.find((f) => f.extension === normalized);
}

export function getFormatByMime(mime: string): MediaFormat | undefined {
  const normalized = mime.toLowerCase().split(";")[0]?.trim() ?? "";
  return MEDIA_FORMATS.find((f) => f.mimeTypes.includes(normalized));
}

export function supportedFormatsLabel(kind?: MediaKind): string {
  const formats = kind ? MEDIA_FORMATS.filter((f) => f.kind === kind && !f.legacy) : MEDIA_FORMATS.filter((f) => !f.legacy);
  const unique = [...new Set(formats.map((f) => f.extension.toUpperCase()))];
  return unique.join(", ");
}

export function maxBytesForKind(kind: MediaKind): number {
  return kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
}

export type StorageHealthState = "healthy" | "warning" | "full";

export function storageHealthState(usedBytes: number): StorageHealthState {
  if (usedBytes >= MAX_STORAGE_BYTES) return "full";
  if (usedBytes >= WARNING_STORAGE_BYTES) return "warning";
  return "healthy";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function storagePercentUsed(usedBytes: number): number {
  return Math.min(100, Math.round((usedBytes / MAX_STORAGE_BYTES) * 1000) / 10);
}
