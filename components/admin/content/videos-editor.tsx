"use client";

import { Plus } from "lucide-react";

import { AreaRow, TextRow } from "@/components/admin/content/fields";
import { ListItemShell, useListState } from "@/components/admin/content/list-editor";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { MediaPathField } from "@/components/admin/media-picker";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import { Select } from "@/components/admin/ui/select";
import { Field } from "@/components/admin/ui/field";
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

const MIME_OPTIONS = [
  { value: "video/mp4", label: "MP4 (video/mp4)" },
  { value: "video/webm", label: "WebM (video/webm)" },
  { value: "video/quicktime", label: "QuickTime / MOV (video/quicktime)" },
];

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
            <MediaPathField
              label="Poster image"
              hint="Choose a still from the Gallery."
              kind="image"
              value={video.poster}
              onPick={(picked) =>
                list.update(index, {
                  poster: picked.publicUrl || `/${picked.storageKey}`,
                })
              }
              onClear={() => list.update(index, { poster: "" })}
              pickerTitle="Choose poster image"
            />
            <MediaPathField
              label="Video (R2)"
              hint="Pick a video uploaded to the Gallery. Sets the object path automatically."
              kind="video"
              value={video.video.objectPath}
              displayValue={video.video.objectPath.split("/").pop() || video.video.objectPath}
              onPick={(picked) =>
                list.update(index, {
                  video: {
                    ...video.video,
                    objectPath: picked.objectPath,
                    mimeType: picked.mimeType || video.video.mimeType,
                    localPath: video.video.localPath || "",
                  },
                })
              }
              onClear={() =>
                list.update(index, {
                  video: { ...video.video, objectPath: "" },
                })
              }
              pickerTitle="Choose video file"
            />
            <TextRow
              label="Local video path (fallback)"
              hint="Optional. Used when R2 is unavailable, e.g. /media/featured-works/reel.mp4"
              value={video.video.localPath}
              onChange={(v) => list.update(index, { video: { ...video.video, localPath: v } })}
            />
            <Field label="MIME type">
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  aria-describedby={describedBy}
                  aria-invalid={invalid || undefined}
                  value={video.video.mimeType || "video/mp4"}
                  onChange={(event) =>
                    list.update(index, {
                      video: { ...video.video, mimeType: event.target.value },
                    })
                  }
                >
                  {MIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  {!MIME_OPTIONS.some((option) => option.value === video.video.mimeType) &&
                  video.video.mimeType ? (
                    <option value={video.video.mimeType}>{video.video.mimeType}</option>
                  ) : null}
                </Select>
              )}
            </Field>
          </ListItemShell>
        ))
      )}

      <div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => list.add({ ...EMPTY, video: { ...EMPTY.video } })}
        >
          <Plus className="size-4" /> Add video
        </Button>
      </div>

      <SaveBar onSave={() => save(list.items)} pending={pending} note="Changes publish to Home and Studio." />
    </div>
  );
}
