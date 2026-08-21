"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { saveProjectAction, type ProjectActionState } from "@/features/projects/actions";

const initial: ProjectActionState = { ok: false, message: "" };

export function ProjectEditor({
  initialValues,
}: {
  initialValues?: {
    slug: string;
    title: string;
    summary?: string | null;
    location?: string | null;
    status?: string;
    is_featured?: boolean;
  };
}) {
  const [state, action, pending] = useActionState(saveProjectAction, initial);
  const isNew = !initialValues?.slug;

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
        label="Summary"
        name="summary"
        defaultValue={initialValues?.summary ?? ""}
        error={state.fieldErrors?.summary}
      />
      <TextField
        label="Location"
        name="location"
        defaultValue={initialValues?.location ?? ""}
        error={state.fieldErrors?.location}
      />

      <label className="flex flex-col gap-2 text-fluid-sm">
        <span className="tracking-widest text-muted uppercase">Status</span>
        <select
          name="status"
          defaultValue={initialValues?.status ?? "draft"}
          className="border border-border bg-surface px-4 py-3"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="flex items-center gap-3 text-fluid-sm text-muted">
        <input
          type="checkbox"
          name="isFeatured"
          defaultChecked={initialValues?.is_featured ?? false}
          className="h-4 w-4 border border-border"
        />
        Feature on the homepage
      </label>

      {state.message ? (
        <p role="alert" className="text-fluid-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" pending={pending} pendingLabel="Saving">
        Save project
      </Button>
    </form>
  );
}
