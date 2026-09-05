"use server";

import { after } from "next/server";
import { headers } from "next/headers";

import { enquirySchema, type EnquiryActionState } from "@/features/enquiries/schema";
import { processEnquiryNotification } from "@/features/notifications/service";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/client-ip";
import { getPublishableSupabase } from "@/lib/supabase/server";

const MIN_OPEN_MS = 2_500;
/** Stricter than generic RATE_LIMIT_MAX — contact spam / malware floods. */
const ENQUIRY_MAX_PER_WINDOW = 5;
const ENQUIRY_WINDOW_MS = 60_000;

function emptyState(message = ""): EnquiryActionState {
  return { ok: false, message };
}

export async function submitEnquiryAction(
  _prev: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const requestHeaders = await headers();
  const ip = getClientIp(requestHeaders);

  const limit = checkRateLimit(`enquiry:${ip}`, ENQUIRY_MAX_PER_WINDOW, ENQUIRY_WINDOW_MS);
  if (!limit.ok) {
    return emptyState("Too many enquiries from this network. Please try again shortly.");
  }

  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    message: formData.get("message"),
    consent: formData.get("consent") === "on" || formData.get("consent") === "true",
    sourcePage: formData.get("sourcePage") || "/contact",
    company: formData.get("company") || "",
    openedAt: formData.get("openedAt"),
  });

  if (!parsed.success) {
    const fieldErrors: EnquiryActionState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form") as keyof NonNullable<
        EnquiryActionState["fieldErrors"]
      >;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      fieldErrors,
    };
  }

  // Silent success for honeypot or instant submissions so scrapers learn nothing.
  if (parsed.data.company) {
    return { ok: true, message: "Thank you. We will be in touch shortly." };
  }

  if (Date.now() - parsed.data.openedAt < MIN_OPEN_MS) {
    return { ok: true, message: "Thank you. We will be in touch shortly." };
  }

  try {
    const supabase = getPublishableSupabase();
    const { error } = await supabase.from("enquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      source_page: parsed.data.sourcePage,
      consent: true,
      // Do not send `status` — anon only has INSERT on safe columns; default is `new`.
    });

    if (error) {
      console.error("Enquiry insert failed", error.code ?? "unknown");
      return emptyState(
        "We could not save your enquiry right now. Please call or email the studio instead.",
      );
    }
  } catch (error) {
    console.error("Enquiry submit unavailable", error instanceof Error ? error.name : "unknown");
    return emptyState(
      "Enquiry storage is not available in this environment yet. Please call or email the studio.",
    );
  }

  after(async () => {
    await processEnquiryNotification({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      sourcePage: parsed.data.sourcePage,
    });
  });

  return {
    ok: true,
    message: "Thank you. Your enquiry has been received — we will reply shortly.",
  };
}
