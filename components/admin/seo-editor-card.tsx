"use client";

import { useActionState, useState } from "react";

import { revertSeoAction, saveSeoAction, type SeoActionState } from "@/features/seo/actions";
import type { SeoSubject, SeoVersion } from "@/features/seo/admin";

const initial: SeoActionState = { ok: false, message: "" };

export function SeoEditorCard({
  subject,
  versions = [],
}: {
  subject: SeoSubject;
  versions?: SeoVersion[];
}) {
  const [open, setOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [compareId, setCompareId] = useState<number | null>(versions[0]?.id ?? null);
  const [state, action, pending] = useActionState(saveSeoAction, initial);
  const [revertState, revertAction, reverting] = useActionState(revertSeoAction, initial);

  const compare = versions.find((v) => v.id === compareId) ?? versions[0] ?? null;

  return (
    <li className="border border-border">
      <button
        type="button"
        className="flex w-full min-h-14 items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <div>
          <p className="display text-fluid-xl">{subject.label}</p>
          <p className="mt-1 text-fluid-xs text-muted">{subject.path}</p>
        </div>
        <p className="text-fluid-sm text-accent">
          {subject.quality.score} · {subject.quality.grade}
        </p>
      </button>

      {open ? (
        <div className="border-t border-border px-5 py-5">
          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="metadataId" value={subject.metadataId} />
            <label className="flex flex-col gap-2">
              <span className="text-fluid-xs tracking-widest text-muted uppercase">Title</span>
              <input
                name="title"
                defaultValue={subject.title ?? ""}
                required
                maxLength={200}
                className="min-h-11 border border-border bg-surface px-4 py-2"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-fluid-xs tracking-widest text-muted uppercase">Description</span>
              <textarea
                name="description"
                defaultValue={subject.description ?? ""}
                required
                maxLength={500}
                rows={4}
                className="border border-border bg-surface px-4 py-3"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-fluid-xs tracking-widest text-muted uppercase">Canonical URL</span>
              <input
                name="canonicalUrl"
                defaultValue={subject.canonicalUrl ?? ""}
                className="min-h-11 border border-border bg-surface px-4 py-2"
                placeholder="https://architak.in/..."
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-fluid-xs tracking-widest text-muted uppercase">Robots</span>
              <select
                name="robots"
                defaultValue={subject.robots ?? ""}
                className="min-h-11 border border-border bg-surface px-4 py-2"
              >
                <option value="">index, follow (default)</option>
                <option value="index, follow">index, follow</option>
                <option value="noindex, follow">noindex, follow</option>
                <option value="noindex, nofollow">noindex, nofollow</option>
              </select>
            </label>

            <ul className="space-y-1 text-fluid-xs text-muted">
              {subject.quality.checks.slice(0, 5).map((check) => (
                <li key={check.id}>
                  {check.score >= 70 ? "✓" : "⚠"} {check.label}
                  {check.hint ? ` · ${check.hint}` : ""}
                </li>
              ))}
            </ul>

            {state.message ? (
              <p role="status" className="text-fluid-sm text-accent">
                {state.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="min-h-11 border border-foreground bg-foreground px-5 py-2 text-fluid-xs tracking-widest text-background uppercase disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </form>

          {!subject.metadataId.startsWith("static:") ? (
            <div className="mt-8 border-t border-border pt-6">
              <button
                type="button"
                className="text-fluid-sm text-accent"
                onClick={() => setShowHistory((value) => !value)}
                aria-expanded={showHistory}
              >
                {showHistory ? "Hide version history" : `Version history (${versions.length})`}
              </button>

              {showHistory ? (
                <div className="mt-4 space-y-4">
                  {versions.length === 0 ? (
                    <p className="text-fluid-sm text-muted">No versions yet — save once to start history.</p>
                  ) : (
                    <>
                      <label className="flex flex-col gap-2 text-fluid-sm">
                        <span className="text-fluid-xs tracking-widest text-muted uppercase">
                          Compare to version
                        </span>
                        <select
                          value={compareId ?? ""}
                          onChange={(event) => setCompareId(Number(event.target.value))}
                          className="min-h-11 border border-border bg-surface px-4 py-2"
                        >
                          {versions.map((version) => (
                            <option key={version.id} value={version.id}>
                              v{version.version_number}
                              {version.quality_score != null ? ` · ${version.quality_score}` : ""}
                              {version.change_summary ? ` · ${version.change_summary}` : ""}
                            </option>
                          ))}
                        </select>
                      </label>

                      {compare ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="border border-border p-4">
                            <p className="text-fluid-xs tracking-widest text-muted uppercase">Current</p>
                            <p className="mt-2 text-fluid-sm font-medium">{subject.title}</p>
                            <p className="mt-2 text-fluid-xs text-muted">{subject.description}</p>
                          </div>
                          <div className="border border-border p-4">
                            <p className="text-fluid-xs tracking-widest text-muted uppercase">
                              v{compare.version_number}
                            </p>
                            <p className="mt-2 text-fluid-sm font-medium">{compare.title}</p>
                            <p className="mt-2 text-fluid-xs text-muted">{compare.description}</p>
                          </div>
                        </div>
                      ) : null}

                      <ul className="divide-y divide-border border border-border">
                        {versions.map((version) => (
                          <li
                            key={version.id}
                            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-fluid-sm">
                                v{version.version_number}
                                {version.quality_score != null ? ` · score ${version.quality_score}` : ""}
                              </p>
                              <p className="mt-1 text-fluid-xs text-muted">
                                {new Date(version.created_at).toLocaleString()}
                                {version.changed_by ? ` · ${version.changed_by}` : ""}
                              </p>
                              {version.change_summary ? (
                                <p className="mt-1 text-fluid-xs text-muted">{version.change_summary}</p>
                              ) : null}
                            </div>
                            <form action={revertAction}>
                              <input type="hidden" name="metadataId" value={subject.metadataId} />
                              <input
                                type="hidden"
                                name="versionNumber"
                                value={version.version_number}
                              />
                              <button
                                type="submit"
                                disabled={reverting}
                                className="min-h-11 border border-border px-4 py-2 text-fluid-xs tracking-widest uppercase disabled:opacity-50"
                              >
                                Revert
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>

                      {revertState.message ? (
                        <p role="status" className="text-fluid-sm text-accent">
                          {revertState.message}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
