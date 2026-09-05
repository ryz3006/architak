"use server";

import { requireAdminSession } from "@/features/auth/session";
import {
  saveWebsiteSectionConfig,
  type WebsiteSectionConfig,
} from "@/features/website/admin";

export type WebsiteMgmtState = { ok: boolean; message: string };

export async function saveWebsiteSectionsAction(
  _prev: WebsiteMgmtState,
  formData: FormData,
): Promise<WebsiteMgmtState> {
  await requireAdminSession();

  const selectedWorkSlugs = String(formData.get("selectedWorkSlugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const studioDomeSlugs = String(formData.get("studioDomeSlugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const homepageVideoIds = String(formData.get("homepageVideoIds") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const config: WebsiteSectionConfig = {
    selectedWorkSlugs,
    studioDomeSlugs,
    homepageVideoIds,
    featuredWorksEnabled: formData.get("featuredWorksEnabled") === "on",
  };

  return saveWebsiteSectionConfig(config);
}
