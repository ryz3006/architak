"use client";

import { useActionState } from "react";

import {
  addEnquiryNoteAction,
  updateEnquiryStatusAction,
  type EnquiryAdminState,
} from "@/features/enquiries/admin-actions";

const initial: EnquiryAdminState = { ok: false, message: "" };

export function EnquiryDetailActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [statusState, statusAction, statusPending] = useActionState(
    updateEnquiryStatusAction,
    initial,
  );
  const [noteState, noteAction, notePending] = useActionState(addEnquiryNoteAction, initial);

  return (
    <div className="mt-10 flex flex-col gap-8">
      <form action={statusAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-fluid-xs tracking-widest text-muted uppercase">Status</span>
          <select
            name="status"
            defaultValue={status}
            className="min-h-11 border border-border bg-surface px-4 py-2"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_discussion">In discussion</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="closed">Closed</option>
            <option value="spam">Spam</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={statusPending}
          className="min-h-11 border border-foreground bg-foreground px-5 py-2 text-fluid-xs tracking-widest text-background uppercase disabled:opacity-50"
        >
          {statusPending ? "Saving…" : "Update status"}
        </button>
      </form>
      {statusState.message ? (
        <p className="text-fluid-sm text-accent" role="status">
          {statusState.message}
        </p>
      ) : null}

      <form action={noteAction} className="flex flex-col gap-3">
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-2">
          <span className="text-fluid-xs tracking-widest text-muted uppercase">Internal note</span>
          <textarea
            name="note"
            rows={4}
            required
            className="border border-border bg-surface px-4 py-3"
            placeholder="Call notes, next steps…"
          />
        </label>
        <button
          type="submit"
          disabled={notePending}
          className="min-h-11 w-fit border border-border px-5 py-2 text-fluid-xs tracking-widest uppercase disabled:opacity-50"
        >
          {notePending ? "Adding…" : "Add note"}
        </button>
      </form>
      {noteState.message ? (
        <p className="text-fluid-sm text-accent" role="status">
          {noteState.message}
        </p>
      ) : null}
    </div>
  );
}
