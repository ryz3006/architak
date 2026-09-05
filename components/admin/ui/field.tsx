import type { ReactNode } from "react";
import { useId } from "react";

import { cn } from "@/lib/cn";

export type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render prop receives ids/state to wire onto the control. */
  children: (props: {
    id: string;
    describedBy: string | undefined;
    invalid: boolean;
  }) => ReactNode;
};

/**
 * Accessible label + hint + error wrapper for admin form controls.
 * Mirrors the public-site `field.tsx` contract but with admin styling.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-fluid-sm font-medium text-foreground">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true" className="text-[var(--admin-danger)]">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-fluid-xs text-muted">
          {hint}
        </p>
      ) : null}

      {children({ id, describedBy: describedBy || undefined, invalid: Boolean(error) })}

      <p
        id={errorId}
        role="alert"
        className={cn("text-fluid-xs text-[var(--admin-danger)]", !error && "sr-only")}
      >
        {error ?? ""}
      </p>
    </div>
  );
}
