import {
  getFormatByExtension,
  getFormatByMime,
  maxBytesForKind,
  MAX_STORAGE_BYTES,
  supportedFormatsLabel,
  type MediaKind,
} from "@/features/media/capabilities";

export type MediaValidationResult =
  | { ok: true; kind: MediaKind; mimeType: string; extension: string; legacy?: boolean }
  | { ok: false; message: string };

function extensionFromName(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.at(-1)?.toLowerCase() ?? "") : "";
}

/** Magic-byte sniffing for common formats. Returns MIME or null if unknown. */
export async function sniffMimeType(file: Blob): Promise<string | null> {
  const buffer = await file.slice(0, 16).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  // AVIF / HEIC brand in ftyp
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
    if (brand === "avif" || brand === "avis") return "image/avif";
    if (brand === "isom" || brand === "iso2" || brand === "mp41" || brand === "mp42" || brand === "M4V ") {
      return "video/mp4";
    }
    if (brand === "qt  ") return "video/quicktime";
  }
  // WebM (EBML)
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "video/webm";
  }
  // SVG text sniff
  const text = new TextDecoder().decode(bytes).trimStart().slice(0, 64).toLowerCase();
  if (text.startsWith("<?xml") || text.startsWith("<svg")) {
    return "image/svg+xml";
  }

  return null;
}

export function validateMediaFileMeta(input: {
  filename: string;
  mimeType: string;
  byteSize: number;
}): MediaValidationResult {
  const extension = extensionFromName(input.filename);
  const byExt = getFormatByExtension(extension);
  const byMime = getFormatByMime(input.mimeType);

  if (!byExt && !byMime) {
    return {
      ok: false,
      message: `This file format isn't supported by the website. Supported images: ${supportedFormatsLabel("image")}. Supported videos: ${supportedFormatsLabel("video")}.`,
    };
  }

  const format = byExt ?? byMime!;
  if (byExt && byMime && byExt.kind !== byMime.kind) {
    return {
      ok: false,
      message: "File extension and MIME type do not match. Please upload a valid media file.",
    };
  }

  const max = maxBytesForKind(format.kind);
  if (input.byteSize > max) {
    return {
      ok: false,
      message: `This ${format.kind} exceeds the maximum size of ${Math.round(max / (1024 * 1024))} MB.`,
    };
  }

  if (input.byteSize <= 0) {
    return { ok: false, message: "The file appears to be empty." };
  }

  return {
    ok: true,
    kind: format.kind,
    mimeType: byMime?.mimeTypes[0] ?? format.mimeTypes[0]!,
    extension: format.extension,
    legacy: format.legacy,
  };
}

export async function validateMediaFile(
  file: File | Blob & { name?: string; type: string },
): Promise<MediaValidationResult> {
  const filename = "name" in file && file.name ? file.name : "upload.bin";
  const meta = validateMediaFileMeta({
    filename,
    mimeType: file.type || "application/octet-stream",
    byteSize: file.size,
  });
  if (!meta.ok) return meta;

  const sniffed = await sniffMimeType(file);
  if (sniffed) {
    const sniffedFormat = getFormatByMime(sniffed);
    if (!sniffedFormat) {
      return {
        ok: false,
        message: `This file format isn't supported by the website. Supported images: ${supportedFormatsLabel("image")}. Supported videos: ${supportedFormatsLabel("video")}.`,
      };
    }
    if (sniffedFormat.kind !== meta.kind) {
      return {
        ok: false,
        message: "File contents do not match the declared type.",
      };
    }
    return {
      ok: true,
      kind: sniffedFormat.kind,
      mimeType: sniffed,
      extension: sniffedFormat.extension,
      legacy: sniffedFormat.legacy,
    };
  }

  // SVG and some browsers omit type — allow extension-based pass when sniff fails
  if (meta.mimeType === "image/svg+xml" || meta.extension === "svg") {
    return meta;
  }

  return meta;
}

export function validateQuota(currentUsageBytes: number, incomingBytes: number): MediaValidationResult {
  const projected = currentUsageBytes + incomingBytes;
  if (projected > MAX_STORAGE_BYTES) {
    return {
      ok: false,
      message:
        "Upload unavailable. This file would exceed the 7 GB storage limit. Please remove unused content and try again.",
    };
  }
  return {
    ok: true,
    kind: "image",
    mimeType: "application/octet-stream",
    extension: "",
  };
}

export function validateBatchQuota(
  currentUsageBytes: number,
  fileSizes: number[],
): { ok: true } | { ok: false; message: string } {
  const combined = fileSizes.reduce((sum, size) => sum + size, 0);
  if (currentUsageBytes + combined > MAX_STORAGE_BYTES) {
    return {
      ok: false,
      message:
        "Upload unavailable. These files would exceed the 7 GB storage limit. Please remove unused content or select fewer files.",
    };
  }
  return { ok: true };
}
