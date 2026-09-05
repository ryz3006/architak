"use client";

import { Plus } from "lucide-react";

import { AreaRow, TextRow } from "@/components/admin/content/fields";
import { ListItemShell, useListState } from "@/components/admin/content/list-editor";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import { saveServicesListAction } from "@/features/content/actions";
import type { ServiceInput } from "@/features/content/schema";

const EMPTY: ServiceInput = { slug: "", title: "", description: "", detail: "", image: "" };

export function ServicesEditor({ initial }: { initial: ServiceInput[] }) {
  const list = useListState<ServiceInput>(initial);
  const { save, pending } = useContentSave(saveServicesListAction);

  return (
    <div className="flex flex-col gap-4">
      {list.items.length === 0 ? (
        <EmptyState title="No services yet" description="Add your first discipline card." />
      ) : (
        list.items.map((service, index) => (
          <ListItemShell
            key={index}
            title={service.title || `Service ${index + 1}`}
            index={index}
            count={list.items.length}
            onMove={(dir) => list.move(index, dir)}
            onRemove={() => list.remove(index)}
          >
            <TextRow
              label="Slug"
              hint="URL-safe identifier, e.g. hospitality."
              value={service.slug}
              onChange={(v) => list.update(index, { slug: v })}
            />
            <TextRow label="Title" value={service.title} onChange={(v) => list.update(index, { title: v })} />
            <TextRow
              label="Short description"
              value={service.description}
              onChange={(v) => list.update(index, { description: v })}
            />
            <AreaRow
              label="Detail"
              rows={3}
              value={service.detail}
              onChange={(v) => list.update(index, { detail: v })}
            />
            <TextRow
              label="Image path"
              hint="Public image path, e.g. /media/hero/feel-lobby.jpg"
              value={service.image}
              onChange={(v) => list.update(index, { image: v })}
            />
          </ListItemShell>
        ))
      )}

      <div>
        <Button variant="outline" size="sm" onClick={() => list.add({ ...EMPTY })}>
          <Plus className="size-4" /> Add service
        </Button>
      </div>

      <SaveBar onSave={() => save(list.items)} pending={pending} note="Changes publish to Services and Home." />
    </div>
  );
}
