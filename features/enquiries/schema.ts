import { z } from "zod";

/**
 * Shared enquiry schema.
 *
 * Client and server validate the same shape so a crafted request cannot skip
 * field rules that the browser already enforces.
 */
export const enquirySchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(120),
    email: z
      .string()
      .trim()
      .email("Enter a valid email.")
      .max(320)
      .optional()
      .or(z.literal("")),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a phone number we can reach.")
      .max(32)
      .optional()
      .or(z.literal("")),
    message: z.string().trim().min(10, "Tell us a little more about the project.").max(5000),
    consent: z
      .boolean()
      .refine((value) => value === true, { message: "Consent is required to send an enquiry." }),
    sourcePage: z.string().startsWith("/").max(500).default("/contact"),
    // Honeypot: bots fill this; humans never see it.
    company: z.string().max(0).optional().or(z.literal("")),
    // Timing check: form must be open for a short period before submit.
    openedAt: z.coerce.number().int().positive(),
  })
  .superRefine((value, ctx) => {
    if (!value.email && !value.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Provide an email or a phone number.",
      });
    }
  });

export type EnquiryInput = z.infer<typeof enquirySchema>;

export type EnquiryFieldErrors = Partial<Record<keyof EnquiryInput | "form", string>>;

export type EnquiryActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: EnquiryFieldErrors;
};
