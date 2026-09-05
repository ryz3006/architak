import { NextResponse } from "next/server";

import { requireAdminApiSession } from "@/lib/admin/api-auth";
import { createMediaUploadUrl, confirmMediaUpload, listAdminMedia } from "@/features/media/admin";
import { getStorageUsage } from "@/features/media/storage-accounting";
import { applySecurityHeaders } from "@/lib/security/headers";

export async function GET(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const kind = (searchParams.get("kind") as "image" | "video" | "all" | null) ?? "all";
  const assets = await listAdminMedia({ search, kind });
  const usage = await getStorageUsage();

  return applySecurityHeaders(NextResponse.json({ ok: true, assets, usage }));
}

export async function POST(request: Request) {
  const auth = await requireAdminApiSession();
  if (!auth.ok) return applySecurityHeaders(auth.response);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return applySecurityHeaders(
      NextResponse.json({ ok: false, message: "Invalid JSON body." }, { status: 400 }),
    );
  }

  const record = body as Record<string, unknown>;
  const action = typeof record.action === "string" ? record.action : "upload-url";

  if (action === "confirm") {
    const mediaAssetId = typeof record.mediaAssetId === "string" ? record.mediaAssetId : "";
    if (!mediaAssetId) {
      return applySecurityHeaders(
        NextResponse.json({ ok: false, message: "mediaAssetId is required." }, { status: 400 }),
      );
    }
    const result = await confirmMediaUpload(mediaAssetId);
    return applySecurityHeaders(
      NextResponse.json(result, { status: result.ok ? 200 : 400 }),
    );
  }

  const filename = typeof record.filename === "string" ? record.filename : "";
  const contentType = typeof record.contentType === "string" ? record.contentType : "";
  const byteSize = typeof record.byteSize === "number" ? record.byteSize : Number(record.byteSize);

  if (!filename || !contentType || !Number.isFinite(byteSize)) {
    return applySecurityHeaders(
      NextResponse.json(
        { ok: false, message: "filename, contentType, and byteSize are required." },
        { status: 400 },
      ),
    );
  }

  const result = await createMediaUploadUrl({
    filename,
    contentType,
    byteSize,
    visibility: record.visibility === "private" ? "private" : "public",
    altText: typeof record.altText === "string" ? record.altText : undefined,
  });

  return applySecurityHeaders(
    NextResponse.json(result, { status: result.ok ? 200 : 400 }),
  );
}
