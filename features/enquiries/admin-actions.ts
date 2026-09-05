"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminSession } from "@/features/auth/session";
import { addEnquiryNote, updateEnquiryStatus } from "@/features/enquiries/admin";

const statusSchema = z.enum([
  "new",
  "contacted",
  "in_discussion",
  "qualified",
  "converted",
  "closed",
  "spam",
]);

export type EnquiryAdminState = { ok: boolean; message: string };

export async function updateEnquiryStatusAction(
  _prev: EnquiryAdminState,
  formData: FormData,
): Promise<EnquiryAdminState> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const parsed = statusSchema.safeParse(formData.get("status"));
  if (!id || !parsed.success) return { ok: false, message: "Invalid status update." };

  const result = await updateEnquiryStatus(id, parsed.data);
  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");
  return result;
}

export async function addEnquiryNoteAction(
  _prev: EnquiryAdminState,
  formData: FormData,
): Promise<EnquiryAdminState> {
  await requireAdminSession();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!id) return { ok: false, message: "Missing enquiry id." };

  const result = await addEnquiryNote(id, note);
  revalidatePath(`/admin/enquiries/${id}`);
  return result;
}
