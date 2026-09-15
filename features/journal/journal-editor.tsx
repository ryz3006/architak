"use client";

import { useActionState } from "react";

import { Button } from "@/components/admin/ui/button";
import { TextField, TextAreaField } from "@/components/ui/field";
import { saveJournalPostAction, type JournalActionState } from "@/features/journal/actions";

const initial: JournalActionState = { ok: false, message: "" };

export type JournalEditorMediaOption = {
  id: string;
  label: string;
  publicUrl: string | null;
  kind: "image" | "video" | "other";
};

export type JournalEditorProjectOption = {
  id: string;
  slug: string;
  title: string;
};

export function JournalEditor({
  initialValues,
  mediaOptions = [],
  projectOptions = [],
}: {
  initialValues?: {
    slug: string;
    title: string;
    excerpt?: string | null;
    body?: { intro?: string; sections?: Array<{ heading?: string; body?: string }> } | null;
    cover_media_id?: string | null;
    status?: string;
    featured?: boolean;
    expires_at?: string | null;
    expiry_action?: "hard_delete" | "archive";
    lang?: string | null;
    dir?: string | null;
    related_project_ids?: string[];
  };
  mediaOptions?: JournalEditorMediaOption[];
  projectOptions?: JournalEditorProjectOption[];
}) {
  const [state, action, pending] = useActionState(saveJournalPostAction, initial);
  const isNew = !initialValues?.slug;
  const imageOptions = mediaOptions.filter((m) => m.kind === "image");
  const bodySections = initialValues?.body?.sections ?? [];

  return (
    <form action={action} className="measure flex flex-col gap-6">
      <TextField
        label="Title"
        name="title"
        required
        defaultValue={initialValues?.title ?? ""}
        error={state.fieldErrors?.title}
      />
      <TextField
        label="Slug"
        name="slug"
        defaultValue={initialValues?.slug ?? ""}
        hint={isNew ? "Leave blank to generate from the title." : "Changing the slug updates the public URL."}
        error={state.fieldErrors?.slug}
      />
      <TextAreaField
        label="Excerpt"
        name="excerpt"
        defaultValue={initialValues?.excerpt ?? ""}
        error={state.fieldErrors?.excerpt}
        hint="Brief summary shown on the index page (max 1000 chars)"
      />

      <label className="flex flex-col gap-2 text-fluid-sm">
        <span className="tracking-widest text-muted uppercase">Status</span>
        <select
          name="status"
          defaultValue={initialValues?.status ?? "draft"}
          className="min-h-11 border border-border bg-surface px-4 py-3"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="flex items-center gap-3 text-fluid-sm text-muted">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={initialValues?.featured ?? false}
          className="h-4 w-4 border border-border"
        />
        Feature on journal index
      </label>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Cover image (optional)</legend>
        <select
          name="coverMediaId"
          defaultValue={initialValues?.cover_media_id ?? ""}
          className="mt-2 min-h-11 w-full border border-border bg-surface px-4 py-3"
        >
          <option value="">No cover (typography-led design)</option>
          {imageOptions.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
        {imageOptions.length === 0 ? (
          <p className="mt-2 text-fluid-xs text-muted">
            Upload images in Media first, then assign them here.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Expiry (optional)</legend>
        <div className="mt-3 space-y-3">
          <label className="flex flex-col gap-2 text-fluid-sm">
            <span className="text-muted">Expires at (UTC)</span>
            <input
              type="datetime-local"
              name="expiresAt"
              defaultValue={initialValues?.expires_at ? new Date(initialValues.expires_at).toISOString().slice(0, 16) : ""}
              className="min-h-11 border border-border bg-surface px-4 py-3"
            />
          </label>
          <label className="flex flex-col gap-2 text-fluid-sm">
            <span className="text-muted">Expiry action</span>
            <select
              name="expiryAction"
              defaultValue={initialValues?.expiry_action ?? "hard_delete"}
              className="min-h-11 border border-border bg-surface px-4 py-3"
            >
              <option value="hard_delete">Move to trash (auto-delete after 7 days)</option>
              <option value="archive">Archive (keep indefinitely)</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Multi-script support</legend>
        <div className="mt-3 space-y-3">
          <label className="flex flex-col gap-2 text-fluid-sm">
            <span className="text-muted">Language (optional)</span>
            <select
              name="lang"
              defaultValue={initialValues?.lang ?? ""}
              className="min-h-11 border border-border bg-surface px-4 py-3"
            >
              <option value="">Not specified</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ar">Arabic</option>
              <option value="ml">Malayalam</option>
              <option value="ta">Tamil</option>
              <option value="kn">Kannada</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-fluid-sm">
            <span className="text-muted">Text direction</span>
            <select
              name="dir"
              defaultValue={initialValues?.dir ?? ""}
              className="min-h-11 border border-border bg-surface px-4 py-3"
            >
              <option value="">Auto (inherit from html)</option>
              <option value="auto">Auto-detect</option>
              <option value="ltr">Left-to-right (LTR)</option>
              <option value="rtl">Right-to-left (RTL)</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Body content</legend>
        <div className="mt-3 space-y-4">
          <TextAreaField
            label="Introduction"
            name="body_intro"
            defaultValue={initialValues?.body?.intro ?? ""}
            rows={4}
          />
          {[0, 1, 2, 3, 4].map((i) => {
            const section = bodySections[i];
            return (
              <div key={i} className="border border-border p-4">
                <p className="mb-3 text-fluid-xs tracking-widest text-muted uppercase">
                  Section {i + 1}
                </p>
                <TextField
                  label="Heading"
                  name={`body_heading_${i}`}
                  defaultValue={section?.heading ?? ""}
                />
                <div className="mt-3">
                  <TextAreaField
                    label="Body"
                    name={`body_body_${i}`}
                    defaultValue={section?.body ?? ""}
                    rows={6}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">
          Related work (optional, max 6)
        </legend>
        {projectOptions.length === 0 ? (
          <p className="mt-2 text-fluid-xs text-muted">
            No published projects available to link.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {projectOptions.map((project) => (
              <li key={project.id} className="flex items-start gap-3 text-fluid-sm">
                <input
                  type="checkbox"
                  name="relatedProjectIds"
                  value={project.id}
                  defaultChecked={initialValues?.related_project_ids?.includes(project.id) ?? false}
                  className="mt-1 h-4 w-4 border border-border"
                />
                <label className="flex-1">{project.title}</label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      {state.message ? (
        <p role="status" className="text-fluid-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save journal post"}
      </Button>
    </form>
  );
}
