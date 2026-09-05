"use client";

import { Plus } from "lucide-react";

import { AreaRow, TextRow } from "@/components/admin/content/fields";
import { ListItemShell, useListState } from "@/components/admin/content/list-editor";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import { saveVideosAction } from "@/features/content/actions";
import type { VideoInput } from "@/features/content/schema";

const EMPTY: VideoInput = {
  id: "",
  title: "",
  category: "",
  location: "",
  summary: "",
  poster: "",
  video: { objectPath: "", localPath: "", mimeType: "video/mp4" },
};

export function VideosEditor({ initial }: { initial: VideoInput[] }) {
  const list = useListState<VideoInput>(initial);
  const { save, pending } = useContentSave(saveVideosAction);

  return (
    <div className="flex flex-col gap-4">
      {list.items.length === 0 ? (
        <EmptyState title="No videos yet" description="Add your first featured reel." />
      ) : (
        list.items.map((video, index) => (
          <ListItemShell
            key={index}
            title={video.title || `Video ${index + 1}`}
            index={index}
            count={list.items.length}
            onMove={(dir) => list.move(index, dir)}
            onRemove={() => list.remove(index)}
          >
            <TextRow
              label="ID"
              hint="Unique identifier used for ordering, e.g. residential-reel."
              value={video.id}
              onChange={(v) => list.update(index, { id: v })}
            />
            <TextRow label="Title" value={video.title} onChange={(v) => list.update(index, { title: v })} />
            <TextRow
              label="Category"
              value={video.category}
              onChange={(v) => list.update(index, { category: v })}
            />
            <TextRow
              label="Location"
              value={video.location}
              onChange={(v) => list.update(index, { location: v })}
            />
            <AreaRow
              label="Summary"
              rows={2}
              value={video.summary}
              onChange={(v) => list.update(index, { summary: v })}
            />
            <TextRow
              label="Poster image path"
              value={video.poster}
              onChange={(v) => list.update(index, { poster: v })}
            />
            <TextRow
              label="Video object path (R2)"
              hint="e.g. portfolio/featured/reel.mp4"
              value={video.video.objectPath}
              onChange={(v) => list.update(index, { video: { ...video.video, objectPath: v } })}
            />
            <TextRow
              label="Local video path (fallback)"
              hint="e.g. /media/featured-works/reel.mp4"
              value={video.video.localPath}
              onChange={(v) => list.update(index, { video: { ...video.video, localPath: v } })}
            />
            <TextRow
              label="MIME type"
              value={video.video.mimeType}
              onChange={(v) => list.update(index, { video: { ...video.video, mimeType: v } })}
            />
          </ListItemShell>
        ))
      )}

      <div>
        <Button variant="outline" size="sm" onClick={() => list.add({ ...EMPTY, video: { ...EMPTY.video } })}>
          <Plus className="size-4" /> Add video
        </Button>
      </div>

      <SaveBar onSave={() => save(list.items)} pending={pending} note="Changes publish to Home and Studio." />
    </div>
  );
}
