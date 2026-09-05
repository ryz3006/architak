"use server";

import { requireAdminSession } from "@/features/auth/session";
import {
  contactContentSchema,
  homeContentSchema,
  servicesContentSchema,
  servicesSchema,
  socialsSchema,
  studioContentSchema,
  studioInfoSchema,
  testimonialsSchema,
  videosSchema,
} from "@/features/content/schema";
import { CONTENT_KEYS } from "@/features/content/site-content";
import { savePageOverride, saveSettingValue, type JsonObject } from "@/features/content/store";
import type { z, ZodType } from "zod";

export type SaveResult = { ok: boolean; message: string };

function firstError(error: z.ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Please check the form and try again.";
  const path = issue.path.join(" › ");
  return path ? `${path}: ${issue.message}` : issue.message;
}

async function validate<T>(schema: ZodType<T>, input: unknown): Promise<
  { ok: true; data: T } | { ok: false; message: string }
> {
  await requireAdminSession();
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  return { ok: true, data: parsed.data };
}

/* ---------------- Page copy ---------------- */

export async function saveHomeContentAction(input: unknown): Promise<SaveResult> {
  const result = await validate(homeContentSchema, input);
  if (!result.ok) return result;
  return savePageOverride("home", result.data as unknown as JsonObject);
}

export async function saveStudioContentAction(input: unknown): Promise<SaveResult> {
  const result = await validate(studioContentSchema, input);
  if (!result.ok) return result;
  return savePageOverride("studio", result.data as unknown as JsonObject);
}

export async function saveServicesContentAction(input: unknown): Promise<SaveResult> {
  const result = await validate(servicesContentSchema, input);
  if (!result.ok) return result;
  return savePageOverride("services", result.data as unknown as JsonObject);
}

export async function saveContactContentAction(input: unknown): Promise<SaveResult> {
  const result = await validate(contactContentSchema, input);
  if (!result.ok) return result;
  return savePageOverride("contact", result.data as unknown as JsonObject);
}

/* ---------------- Global lists / settings ---------------- */

export async function saveSocialsAction(input: unknown): Promise<SaveResult> {
  const result = await validate(socialsSchema, input);
  if (!result.ok) return result;
  return saveSettingValue(CONTENT_KEYS.socials, result.data, "Social profile links", [
    "/",
    "/studio",
    "/services",
    "/contact",
  ]);
}

export async function saveStudioInfoAction(input: unknown): Promise<SaveResult> {
  const result = await validate(studioInfoSchema, input);
  if (!result.ok) return result;
  return saveSettingValue(CONTENT_KEYS.studioInfo, result.data, "Studio contact details", [
    "/",
    "/studio",
    "/services",
    "/contact",
  ]);
}

export async function saveTestimonialsAction(input: unknown): Promise<SaveResult> {
  const result = await validate(testimonialsSchema, input);
  if (!result.ok) return result;
  return saveSettingValue(CONTENT_KEYS.testimonials, result.data, "Studio testimonials", ["/studio"]);
}

export async function saveVideosAction(input: unknown): Promise<SaveResult> {
  const result = await validate(videosSchema, input);
  if (!result.ok) return result;
  return saveSettingValue(CONTENT_KEYS.videos, result.data, "Featured work videos", ["/", "/studio"]);
}

export async function saveServicesListAction(input: unknown): Promise<SaveResult> {
  const result = await validate(servicesSchema, input);
  if (!result.ok) return result;
  return saveSettingValue(CONTENT_KEYS.services, result.data, "Services and disciplines", [
    "/",
    "/services",
  ]);
}
