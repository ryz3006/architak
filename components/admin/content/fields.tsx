"use client";

import { Field } from "@/components/admin/ui/field";
import { Input } from "@/components/admin/ui/input";
import { Textarea } from "@/components/admin/ui/textarea";

export function TextRow({
  label,
  value,
  onChange,
  hint,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <Field label={label} hint={hint} required={required}>
      {({ id, describedBy }) => (
        <Input
          id={id}
          aria-describedby={describedBy}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

export function AreaRow({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <Field label={label} hint={hint}>
      {({ id, describedBy }) => (
        <Textarea
          id={id}
          aria-describedby={describedBy}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </Field>
  );
}

/**
 * Edits an ordered list of short strings (one per line). Used for headline
 * fragments, manifesto lines, etc.
 */
export function LinesRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint ?? "One line per row."}>
      {({ id, describedBy }) => (
        <Textarea
          id={id}
          aria-describedby={describedBy}
          rows={Math.min(8, Math.max(3, value.length + 1))}
          value={value.join("\n")}
          onChange={(event) =>
            onChange(event.target.value.split("\n").map((line) => line.replace(/\r$/, "")))
          }
        />
      )}
    </Field>
  );
}
