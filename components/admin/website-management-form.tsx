"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useActionState, useEffect, useMemo, useState } from "react";

import { useAdminLoading } from "@/components/admin/loading";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Select } from "@/components/admin/ui/select";
import {
  saveWebsiteSectionsAction,
  type WebsiteMgmtState,
} from "@/features/website/actions";
import type { WebsiteSectionConfig } from "@/features/website/admin";

const initial: WebsiteMgmtState = { ok: false, message: "" };

function SelectionList({
  selected,
  options,
  onChange,
  emptyLabel,
}: {
  selected: string[];
  options: { id: string; label: string }[];
  onChange: (next: string[]) => void;
  emptyLabel: string;
}) {
  const [pick, setPick] = useState("");
  const byId = useMemo(() => new Map(options.map((option) => [option.id, option.label])), [options]);
  const available = options.filter((option) => !selected.includes(option.id));

  function add() {
    if (!pick || selected.includes(pick)) return;
    onChange([...selected, pick]);
    setPick("");
  }

  function remove(id: string) {
    onChange(selected.filter((item) => item !== id));
  }

  function move(id: string, direction: -1 | 1) {
    const index = selected.indexOf(id);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= selected.length) return;
    const next = [...selected];
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item!);
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={pick}
          onChange={(event) => setPick(event.target.value)}
          className="min-w-0 flex-1"
        >
          <option value="">
            {available.length === 0 ? "All options already added" : "Choose an item to add…"}
          </option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button type="button" variant="outline" size="sm" onClick={add} disabled={!pick}>
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {selected.length === 0 ? (
        <p className="rounded-[var(--admin-radius-sm)] border border-dashed border-[var(--admin-border)] px-4 py-6 text-center text-fluid-sm text-muted">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {selected.map((id, index) => (
            <li
              key={id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-fluid-sm font-medium text-foreground">
                  {byId.get(id) ?? id}
                </p>
                <p className="text-fluid-xs text-muted">Position {index + 1}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => move(id, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Move down"
                  disabled={index === selected.length - 1}
                  onClick={() => move(id, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove"
                  onClick={() => remove(id)}
                >
                  <Trash2 className="size-4 text-[var(--admin-danger)]" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const [featuredEnabled, setFeaturedEnabled] = useState(initialConfig.featuredWorksEnabled);
  const [state, action, pending] = useActionState(saveWebsiteSectionsAction, initial);
  const { start, stop } = useAdminLoading();

  useEffect(() => {
    if (pending) start("placement-save");
    else stop("placement-save");
  }, [pending, start, stop]);

  const projects = projectOptions.map((project) => ({
    id: project.slug,
    label: project.title,
  }));
  const videoItems = videoOptions.map((video) => ({
    id: video.id,
    label: video.title,
  }));

  return (
    <form action={action} className="mt-8 flex flex-col gap-6">
      <input type="hidden" name="selectedWorkSlugs" value={selectedWork.join(",")} />
      <input type="hidden" name="studioDomeSlugs" value={dome.join(",")} />
      <input type="hidden" name="homepageVideoIds" value={videos.join(",")} />
      {featuredEnabled ? <input type="hidden" name="featuredWorksEnabled" value="on" /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Home — Selected work</CardTitle>
          <CardDescription>
            Projects featured on the homepage. Order matches the public display · {selectedWork.length}{" "}
            selected
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionList
            selected={selectedWork}
            options={projects}
            onChange={setSelectedWork}
            emptyLabel="Add projects from the dropdown to feature them on Home."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage videos</CardTitle>
          <CardDescription>
            Featured reels on Home · {videos.length} selected. Manage the reel library under Content →
            Videos.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <SelectionList
            selected={videos}
            options={videoItems}
            onChange={setVideos}
            emptyLabel="Add videos from the dropdown after creating them under Content → Videos."
          />
          <label className="flex items-center gap-3 text-fluid-sm text-muted">
            <input
              type="checkbox"
              checked={featuredEnabled}
              onChange={(event) => setFeaturedEnabled(event.target.checked)}
            />
            Enable “See the work unfold”
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Studio — Explore the Spaces</CardTitle>
          <CardDescription>
            Projects in the Studio dome · {dome.length} selected. Fewer than needed will repeat in a
            controlled pattern.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SelectionList
            selected={dome}
            options={projects}
            onChange={setDome}
            emptyLabel="Add projects from the dropdown for the Studio experience."
          />
        </CardContent>
      </Card>

      {state.message ? (
        <p
          role="status"
          className={
            state.ok ? "text-fluid-sm text-[var(--admin-success)]" : "text-fluid-sm text-accent"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} aria-busy={pending} className="w-fit">
        {pending ? "Publishing…" : "Publish configuration"}
      </Button>
    </form>
  );
}
