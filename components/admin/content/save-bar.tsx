"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/admin/ui/button";

export type SaveResult = { ok: boolean; message: string };

/**
 * Wraps a content save server action with pending state + toast feedback.
 */
export function useContentSave<T>(action: (input: T) => Promise<SaveResult>) {
  const [pending, startTransition] = useTransition();

  function save(input: T) {
    startTransition(async () => {
      try {
        const result = await action(input);
        if (result.ok) toast.success(result.message);
        else toast.error(result.message);
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return { save, pending };
}

export function SaveBar({
  onSave,
  pending,
  note,
}: {
  onSave: () => void;
  pending: boolean;
  note?: string;
}) {
  return (
    <div className="sticky bottom-0 z-10 mt-8 flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-background/90 py-3 backdrop-blur">
      {note ? <p className="mr-auto text-fluid-xs text-muted">{note}</p> : null}
      <Button onClick={onSave} disabled={pending} aria-busy={pending}>
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </div>
  );
}
