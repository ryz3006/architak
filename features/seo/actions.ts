"use server";

import { requireAdminSession } from "@/features/auth/session";
import { revertSeoVersion, saveSeoSubject } from "@/features/seo/admin";

export type SeoActionState = { ok: boolean; message: string };

export async function saveSeoAction(
  _prev: SeoActionState,
  formData: FormData,
): Promise<SeoActionState> {
  const session = await requireAdminSession();
  return saveSeoSubject({
    metadataId: String(formData.get("metadataId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? "") || undefined,
    robots: String(formData.get("robots") ?? "") || undefined,
    changedBy: session.u,
  });
}

export async function revertSeoAction(
  _prev: SeoActionState,
  formData: FormData,
): Promise<SeoActionState> {
  const session = await requireAdminSession();
  return revertSeoVersion({
    metadataId: String(formData.get("metadataId") ?? ""),
    versionNumber: Number(formData.get("versionNumber")),
    changedBy: session.u,
  });
}
