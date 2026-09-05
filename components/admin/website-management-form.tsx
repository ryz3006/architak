"use client";

import { useActionState, useState } from "react";

import {
  saveWebsiteSectionsAction,
  type WebsiteMgmtState,
} from "@/features/website/actions";
import type { WebsiteSectionConfig } from "@/features/website/admin";

const initial: WebsiteMgmtState = { ok: false, message: "" };

export function WebsiteManagementForm({
  initialConfig,
  projectOptions,
  videoOptions,
}: {
  initialConfig: WebsiteSectionConfig;
  projectOptions: { slug: string; title: string }[];
  videoOptions: { id: string; title: string }[];
}) {
  const [selectedWork, setSelectedWork] = useState(initialConfig.selectedWorkSlugs);
  const [dome, setDome] = useState(initialConfig.studioDomeSlugs);
  const [videos, setVideos] = useState(initialConfig.homepageVideoIds);
  const [state, action, pending] = useActionState(saveWebsiteSectionsAction, initial);

  function toggle(list: string[], slug: string, setter: (next: string[]) => void) {
    setter(list.includes(slug) ? list.filter((s) => s !== slug) : [...list, slug]);
  }

  function move(list: string[], slug: string, direction: -1 | 1, setter: (next: string[]) => void) {
    const index = list.indexOf(slug);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const next = [...list];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item!);
    setter(next);
  }

  return (
    <form action={action} className="mt-10 flex flex-col gap-10">
      <input type="hidden" name="selectedWorkSlugs" value={selectedWork.join(",")} />
      <input type="hidden" name="studioDomeSlugs" value={dome.join(",")} />
      <input type="hidden" name="homepageVideoIds" value={videos.join(",")} />

      <section className="border border-border p-5">
        <h2 className="display text-fluid-xl">Home — Selected Work</h2>
        <p className="mt-2 text-fluid-sm text-muted">
          {selectedWork.length} projects selected
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {projectOptions.map((project) => {
            const checked = selectedWork.includes(project.slug);
            return (
              <li
                key={project.slug}
                className="flex flex-wrap items-center justify-between gap-2 border border-border px-3 py-3"
              >
                <label className="flex min-h-11 items-center gap-3 text-fluid-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(selectedWork, project.slug, setSelectedWork)}
                  />
                  {project.title}
                </label>
                {checked ? (
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="min-h-11 border border-border px-3 text-fluid-xs uppercase"
                      onClick={() => move(selectedWork, project.slug, -1, setSelectedWork)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="min-h-11 border border-border px-3 text-fluid-xs uppercase"
                      onClick={() => move(selectedWork, project.slug, 1, setSelectedWork)}
                    >
                      Down
                    </button>
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border border-border p-5">
        <h2 className="display text-fluid-xl">Homepage videos</h2>
        <p className="mt-2 text-fluid-sm text-muted">{videos.length} videos selected</p>
        <ul className="mt-4 flex flex-col gap-2">
          {videoOptions.map((video) => (
            <li key={video.id}>
              <label className="flex min-h-11 items-center gap-3 text-fluid-sm">
                <input
                  type="checkbox"
                  checked={videos.includes(video.id)}
                  onChange={() => toggle(videos, video.id, setVideos)}
                />
                {video.title}
              </label>
            </li>
          ))}
          {videoOptions.length === 0 ? (
            <li className="text-fluid-sm text-muted">
              Upload videos in Gallery, then reference them here (IDs from featured work config).
            </li>
          ) : null}
        </ul>
        <label className="mt-4 flex items-center gap-3 text-fluid-sm text-muted">
          <input
            type="checkbox"
            name="featuredWorksEnabled"
            defaultChecked={initialConfig.featuredWorksEnabled}
          />
          Enable “See the work unfold”
        </label>
      </section>

      <section className="border border-border p-5">
        <h2 className="display text-fluid-xl">Studio — Explore the Spaces</h2>
        <p className="mt-2 text-fluid-sm text-muted">
          {dome.length} projects selected. Fewer than required visual nodes will repeat in a
          controlled pattern.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {projectOptions.map((project) => (
            <li key={project.slug}>
              <label className="flex min-h-11 items-center gap-3 text-fluid-sm">
                <input
                  type="checkbox"
                  checked={dome.includes(project.slug)}
                  onChange={() => toggle(dome, project.slug, setDome)}
                />
                {project.title}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {state.message ? (
        <p role="status" className="text-fluid-sm text-accent">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-fit border border-foreground bg-foreground px-6 py-3 text-fluid-sm tracking-widest text-background uppercase disabled:opacity-50"
      >
        {pending ? "Publishing…" : "Publish configuration"}
      </button>
    </form>
  );
}
