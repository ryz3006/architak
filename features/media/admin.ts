import "server-only";

import { requireAdminSession } from "@/features/auth/session";
import { getStorageService } from "@/lib/storage/r2";
import { getSecretSupabase } from "@/lib/supabase/server";
import { validateMediaFileMeta } from "@/features/media/validation";
import { assertUploadFitsQuota } from "@/features/media/storage-accounting";
import { randomUUID } from "crypto";

export type AdminMediaAsset = {
  id: string;
  storage_key: string;
  visibility: "public" | "private";
  mime_type: string;
  byte_size: number;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
  publicUrl: string | null;
  kind: "image" | "video" | "other";
};

export type MediaUsage = {
  type: "project_cover" | "project_media" | "site_setting";
  label: string;
  href?: string;
};

function kindFromMime(mime: string): "image" | "video" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "other";
}

export async function listAdminMedia(options?: {
  search?: string;
  kind?: "image" | "video" | "all";
  limit?: number;
  offset?: number;
}): Promise<AdminMediaAsset[]> {
  await requireAdminSession();
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  try {
    const supabase = getSecretSupabase();
    let query = supabase
      .from("media_assets")
      .select(
        "id, storage_key, visibility, mime_type, byte_size, width, height, alt_text, caption, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.kind === "image") {
      query = query.like("mime_type", "image/%");
    } else if (options?.kind === "video") {
      query = query.like("mime_type", "video/%");
    }

    if (options?.search?.trim()) {
      const term = `%${options.search.trim()}%`;
      query = query.or(`storage_key.ilike.${term},alt_text.ilike.${term},caption.ilike.${term}`);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    const storage = getStorageService();
    return data.map((row) => ({
      ...row,
      publicUrl:
        row.visibility === "public" ? storage.getPublicUrl(row.storage_key) : null,
      kind: kindFromMime(row.mime_type),
    }));
  } catch {
    return [];
  }
}

export async function getMediaUsages(mediaAssetId: string): Promise<MediaUsage[]> {
  await requireAdminSession();
  const usages: MediaUsage[] = [];

  try {
    const supabase = getSecretSupabase();

    const { data: covers } = await supabase
      .from("projects")
      .select("slug, title")
      .eq("cover_media_id", mediaAssetId);

    for (const project of covers ?? []) {
      usages.push({
        type: "project_cover",
        label: `${project.title} — Cover Image`,
        href: `/admin/projects/${project.slug}`,
      });
    }

    const { data: gallery } = await supabase
      .from("project_media")
      .select("role, project_id")
      .eq("media_asset_id", mediaAssetId);

    const projectIds = [...new Set((gallery ?? []).map((row) => row.project_id))];
    if (projectIds.length > 0) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id, slug, title")
        .in("id", projectIds);
      const byId = new Map((projects ?? []).map((p) => [p.id, p]));
      for (const row of gallery ?? []) {
        const project = byId.get(row.project_id);
        if (!project) continue;
        usages.push({
          type: "project_media",
          label: `${project.title} — ${row.role}`,
          href: `/admin/projects/${project.slug}`,
        });
      }
    }
  } catch {
    // return what we have
  }

  return usages;
}

export async function createMediaUploadUrl(input: {
  filename: string;
  contentType: string;
  byteSize: number;
  visibility?: "public" | "private";
  altText?: string;
}): Promise<
  | {
      ok: true;
      uploadUrl: string;
      storageKey: string;
      mediaAssetId: string;
      visibility: "public" | "private";
    }
  | { ok: false; message: string }
> {
  await requireAdminSession();

  const validated = validateMediaFileMeta({
    filename: input.filename,
    mimeType: input.contentType,
    byteSize: input.byteSize,
  });
  if (!validated.ok) return validated;

  const quota = await assertUploadFitsQuota(input.byteSize);
  if (!quota.ok) return { ok: false, message: quota.message };

  const visibility = input.visibility ?? "public";
  const safeName = input.filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
  const objectPath = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}-${safeName}`;

  try {
    const storage = getStorageService();
    const { uploadUrl, storageKey } = await storage.createUploadUrl({
      visibility,
      objectPath,
      contentType: validated.mimeType,
      expiresInSeconds: 600,
    });

    const supabase = getSecretSupabase();
    const mediaAssetId = randomUUID();
    const { error } = await supabase.from("media_assets").insert({
      id: mediaAssetId,
      storage_key: storageKey,
      visibility,
      mime_type: validated.mimeType,
      byte_size: input.byteSize,
      alt_text: input.altText?.slice(0, 300) || null,
      metadata: { pendingUpload: true, originalFilename: input.filename },
    });

    if (error) {
      return { ok: false, message: "Could not register media asset. Confirm the database migration is applied." };
    }

    await supabase.from("audit_events").insert({
      action: "media.upload_url_created",
      entity_type: "media_assets",
      entity_id: mediaAssetId,
      after_data: { storageKey, visibility, byteSize: input.byteSize },
    });

    return { ok: true, uploadUrl, storageKey, mediaAssetId, visibility };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("R2")
        ? "Media storage is not configured. Set R2 credentials to upload."
        : "Could not create upload URL.";
    return { ok: false, message };
  }
}

export async function confirmMediaUpload(mediaAssetId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { data, error } = await supabase
      .from("media_assets")
      .select("id, metadata")
      .eq("id", mediaAssetId)
      .maybeSingle();

    if (error || !data) return { ok: false, message: "Media asset not found." };

    const metadata =
      data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
        ? { ...(data.metadata as Record<string, unknown>), pendingUpload: false }
        : { pendingUpload: false };

    await supabase.from("media_assets").update({ metadata }).eq("id", mediaAssetId);
    return { ok: true, message: "Upload confirmed." };
  } catch {
    return { ok: false, message: "Could not confirm upload." };
  }
}

export async function deleteMediaAsset(
  mediaAssetId: string,
  options?: { force?: boolean },
): Promise<{ ok: boolean; message: string; usages?: MediaUsage[] }> {
  await requireAdminSession();
  const usages = await getMediaUsages(mediaAssetId);
  if (usages.length > 0 && !options?.force) {
    return {
      ok: false,
      message: `This asset is used in ${usages.length} place${usages.length === 1 ? "" : "s"}. Replace references before deleting.`,
      usages,
    };
  }

  try {
    const supabase = getSecretSupabase();
    const { data: asset } = await supabase
      .from("media_assets")
      .select("storage_key, visibility")
      .eq("id", mediaAssetId)
      .maybeSingle();

    if (!asset) return { ok: false, message: "Media asset not found." };

    if (usages.length > 0 && options?.force) {
      await supabase.from("projects").update({ cover_media_id: null }).eq("cover_media_id", mediaAssetId);
      await supabase.from("project_media").delete().eq("media_asset_id", mediaAssetId);
    }

    const { error } = await supabase.from("media_assets").delete().eq("id", mediaAssetId);
    if (error) {
      return { ok: false, message: "Could not delete media record. It may still be referenced." };
    }

    try {
      await getStorageService().deleteObject(asset.storage_key, asset.visibility);
    } catch {
      // DB record removed; R2 cleanup may be retried later
    }

    await supabase.from("audit_events").insert({
      action: "media.deleted",
      entity_type: "media_assets",
      entity_id: mediaAssetId,
      before_data: { storage_key: asset.storage_key },
    });

    return { ok: true, message: "Media deleted." };
  } catch {
    return { ok: false, message: "Delete failed." };
  }
}

export async function updateMediaMeta(
  mediaAssetId: string,
  input: { altText?: string; caption?: string },
): Promise<{ ok: boolean; message: string }> {
  await requireAdminSession();
  try {
    const supabase = getSecretSupabase();
    const { error } = await supabase
      .from("media_assets")
      .update({
        alt_text: input.altText?.slice(0, 300) ?? null,
        caption: input.caption?.slice(0, 1000) ?? null,
      })
      .eq("id", mediaAssetId);
    if (error) return { ok: false, message: "Could not update media." };
    return { ok: true, message: "Saved." };
  } catch {
    return { ok: false, message: "Could not update media." };
  }
}
