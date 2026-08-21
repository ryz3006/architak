"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { Announcer } from "@/components/ui/announcer";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { submitEnquiryAction } from "@/features/enquiries/actions";
import type { EnquiryActionState } from "@/features/enquiries/schema";

const initialState: EnquiryActionState = { ok: false, message: "" };

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(submitEnquiryAction, initialState);
  const [openedAt] = useState(() => Date.now());
  const formRef = useRef<HTMLFormElement>(null);
  const firstErrorRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!state.fieldErrors) return;
    const order = ["name", "email", "phone", "message", "consent"] as const;
    for (const key of order) {
      if (!state.fieldErrors[key]) continue;
      const node = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
        `[name="${key}"]`,
      );
      node?.focus();
      firstErrorRef.current = node ?? null;
      break;
    }
  }, [state.fieldErrors]);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="measure flex flex-col gap-6" noValidate>
      <Announcer message={state.message} />

      <input type="hidden" name="openedAt" value={openedAt} />
      <input type="hidden" name="sourcePage" value="/contact" />

      {/* Honeypot: visually hidden, not display:none, so bots still fill it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <TextField
        label="Name"
        name="name"
        required
        autoComplete="name"
        error={state.fieldErrors?.name}
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        hint="Email or phone is enough — both is better."
        error={state.fieldErrors?.email}
      />
      <TextField
        label="Phone"
        name="phone"
        type="tel"
        autoComplete="tel"
        error={state.fieldErrors?.phone}
      />
      <TextAreaField
        label="About the project"
        name="message"
        required
        rows={5}
        hint="Rooms, timeline, and any references that matter."
        error={state.fieldErrors?.message}
      />

      <label className="flex items-start gap-3 text-fluid-sm text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 border border-border bg-surface"
          aria-invalid={state.fieldErrors?.consent ? true : undefined}
        />
        <span>
          I agree to be contacted about this enquiry. Details stay with ARCHITAK and are not sold.
          {state.fieldErrors?.consent ? (
            <span role="alert" className="mt-1 block text-accent">
              {state.fieldErrors.consent}
            </span>
          ) : null}
        </span>
      </label>

      {state.message ? (
        <p
          role={state.ok ? "status" : "alert"}
          className={state.ok ? "text-fluid-sm text-accent" : "text-fluid-sm text-accent"}
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" pending={pending} pendingLabel="Sending">
        Send enquiry
      </Button>
    </form>
  );
}
