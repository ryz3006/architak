"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/field";
import { saveProjectAction, type ProjectActionState } from "@/features/projects/actions";

const initial: ProjectActionState = { ok: false, message: "" };

export type ProjectEditorMediaOption = {
  id: string;
  label: string;
  publicUrl: string | null;
  kind: "image" | "video" | "other";
};

export function ProjectEditor({
  initialValues,
  mediaOptions = [],
}: {
  initialValues?: {
    slug: string;
    title: string;
    summary?: string | null;
    location?: string | null;
    status?: string;
    is_featured?: boolean;
    category?: string;
    cover_media_id?: string | null;
    gallery_media_ids?: string[];
    body?: { intro?: string; sections?: Array<{ heading?: string; body?: string }> } | null;
    testimonials?: Array<{
      quote: string;
      author_name: string;
      author_role: string | null;
      location: string | null;
      is_enabled: boolean;
    }>;
  };
  mediaOptions?: ProjectEditorMediaOption[];
}) {
  const [state, action, pending] = useActionState(saveProjectAction, initial);
  const isNew = !initialValues?.slug;
  const imageOptions = mediaOptions.filter((m) => m.kind === "image");
  const testimonials = initialValues?.testimonials ?? [];
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
        <span className="tracking-widest text-muted uppercase">Project type</span>
        <select
          name="category"
          defaultValue={initialValues?.category ?? "residential"}
          className="min-h-11 border border-border bg-surface px-4 py-3"
        >
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="workspace">Workspace</option>
          <option value="hospitality">Hospitality</option>
          <option value="interior">Interior</option>
          <option value="corporate">Corporate</option>
          <option value="restaurant">Restaurant</option>
          <option value="industrial">Industrial</option>
          <option value="other">Other</option>
        </select>
      </label>

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

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Cover image</legend>
        <select
          name="coverMediaId"
          defaultValue={initialValues?.cover_media_id ?? ""}
          className="mt-2 min-h-11 w-full border border-border bg-surface px-4 py-3"
        >
          <option value="">No cover (static fallback)</option>
          {imageOptions.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.label}
            </option>
          ))}
        </select>
        {imageOptions.length === 0 ? (
          <p className="mt-2 text-fluid-xs text-muted">
            Upload images in Gallery first, then assign them here.
          </p>
        ) : null}
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">Gallery media</legend>
        {imageOptions.length === 0 ? (
          <p className="mt-2 text-fluid-xs text-muted">No gallery images available yet.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {imageOptions.map((asset) => (
              <li key={asset.id} className="flex items-start gap-3 text-fluid-sm">
                <input
                  type="checkbox"
                  name="galleryMediaIds"
                  value={asset.id}
                  defaultChecked={initialValues?.gallery_media_ids?.includes(asset.id)}
                  className="mt-1 h-4 w-4 border border-border"
                />
                <span className="min-w-0">
                  <span className="block truncate">{asset.label}</span>
                  {asset.publicUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.publicUrl}
                      alt=""
                      className="mt-2 h-16 w-full object-cover"
                    />
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">
          Testimonials (up to 3)
        </legend>
        <div className="mt-3 flex flex-col gap-6">
          {[0, 1, 2].map((index) => {
            const existing = testimonials[index];
            return (
              <div key={index} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <p className="text-fluid-xs tracking-widest text-muted uppercase">Voice {index + 1}</p>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Quote</span>
                  <textarea
                    name={`testimonial_quote_${index}`}
                    defaultValue={existing?.quote ?? ""}
                    rows={3}
                    className="border border-border bg-surface px-4 py-3"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Name</span>
                  <input
                    name={`testimonial_name_${index}`}
                    defaultValue={existing?.author_name ?? ""}
                    className="min-h-11 border border-border bg-surface px-4 py-2"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Role</span>
                  <input
                    name={`testimonial_role_${index}`}
                    defaultValue={existing?.author_role ?? ""}
                    className="min-h-11 border border-border bg-surface px-4 py-2"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Location</span>
                  <input
                    name={`testimonial_location_${index}`}
                    defaultValue={existing?.location ?? ""}
                    className="min-h-11 border border-border bg-surface px-4 py-2"
                  />
                </label>
                <label className="mt-3 flex items-center gap-3 text-fluid-sm text-muted">
                  <input
                    type="checkbox"
                    name={`testimonial_enabled_${index}`}
                    defaultChecked={existing?.is_enabled ?? true}
                    className="h-4 w-4 border border-border"
                  />
                  Show on studio
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="border border-border p-4">
        <legend className="px-2 text-fluid-xs tracking-widest text-muted uppercase">
          Project story (optional)
        </legend>
        <p className="mt-2 text-fluid-xs text-muted">
          A longer narrative shown on the project page, below the summary.
        </p>
        <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
          <span>Intro</span>
          <textarea
            name="body_intro"
            defaultValue={initialValues?.body?.intro ?? ""}
            rows={3}
            className="border border-border bg-surface px-4 py-3"
          />
        </label>
        <div className="mt-3 flex flex-col gap-6">
          {[0, 1, 2].map((index) => {
            const section = bodySections[index];
            return (
              <div key={index} className="border-t border-border pt-4 first:border-t-0 first:pt-0">
                <p className="text-fluid-xs tracking-widest text-muted uppercase">Section {index + 1}</p>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Heading</span>
                  <input
                    name={`body_heading_${index}`}
                    defaultValue={section?.heading ?? ""}
                    className="min-h-11 border border-border bg-surface px-4 py-2"
                  />
                </label>
                <label className="mt-3 flex flex-col gap-2 text-fluid-sm">
                  <span>Body</span>
                  <textarea
                    name={`body_body_${index}`}
                    defaultValue={section?.body ?? ""}
                    rows={4}
                    className="border border-border bg-surface px-4 py-3"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {state.message ? (
        <p role="alert" className="text-fluid-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : isNew ? "Create project" : "Save changes"}
      </Button>
    </form>
  );
}
