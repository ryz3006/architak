"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

const CONTROL_CLASSES = cn(
  "w-full border border-border bg-surface px-4 py-3 text-fluid-base text-foreground",
  "placeholder:text-muted",
  "transition-colors duration-[var(--duration-micro)]",
  "aria-[invalid=true]:border-[color-mix(in_srgb,var(--color-accent)_70%,white)]",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  controlId: string;
  children: (ids: { describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/**
 * Shared label, hint, and error wiring.
 *
 * The error is rendered in an assertive live region and referenced through
 * aria-describedby, so a screen reader announces it without the user having to
 * hunt for the message.
 */
function FieldShell({ label, hint, error, required, controlId, children }: FieldShellProps) {
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={controlId} className="text-fluid-sm tracking-widest text-muted uppercase">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-fluid-xs text-muted">
          {hint}
        </p>
      ) : null}

      {children({ describedBy: describedBy || undefined, invalid: Boolean(error) })}

      <p
        id={errorId}
        role="alert"
        className={cn("text-fluid-xs text-accent", !error && "sr-only")}
      >
        {error ?? ""}
      </p>
    </div>
  );
}

export type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "aria-invalid"> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextField({ label, hint, error, className, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      controlId={id}
    >
      {({ describedBy, invalid }) => (
        <input
          {...props}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(CONTROL_CLASSES, className)}
        />
      )}
    </FieldShell>
  );
}

export type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id" | "aria-invalid"
> & {
  label: string;
  hint?: string;
  error?: string;
};

export function TextAreaField({ label, hint, error, className, ...props }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      controlId={id}
    >
      {({ describedBy, invalid }) => (
        <textarea
          {...props}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={cn(CONTROL_CLASSES, "min-h-32 resize-y", className)}
        />
      )}
    </FieldShell>
  );
}
