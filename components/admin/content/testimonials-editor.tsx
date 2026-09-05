"use client";

import { Plus } from "lucide-react";

import { AreaRow, TextRow } from "@/components/admin/content/fields";
import { ListItemShell, useListState } from "@/components/admin/content/list-editor";
import { SaveBar, useContentSave } from "@/components/admin/content/save-bar";
import { Button } from "@/components/admin/ui/button";
import { EmptyState } from "@/components/admin/empty-state";
import { saveTestimonialsAction } from "@/features/content/actions";
import type { TestimonialInput } from "@/features/content/schema";

const EMPTY: TestimonialInput = { quote: "", name: "", role: "", location: "", image: "" };

export function TestimonialsEditor({ initial }: { initial: TestimonialInput[] }) {
  const list = useListState<TestimonialInput>(initial);
  const { save, pending } = useContentSave(saveTestimonialsAction);

  return (
    <div className="flex flex-col gap-4">
      {list.items.length === 0 ? (
        <EmptyState title="No testimonials yet" description="Add your first client voice." />
      ) : (
        list.items.map((item, index) => (
          <ListItemShell
            key={index}
            title={item.name || `Testimonial ${index + 1}`}
            index={index}
            count={list.items.length}
            onMove={(dir) => list.move(index, dir)}
            onRemove={() => list.remove(index)}
          >
            <AreaRow
              label="Quote"
              rows={3}
              value={item.quote}
              onChange={(v) => list.update(index, { quote: v })}
            />
            <TextRow label="Name" value={item.name} onChange={(v) => list.update(index, { name: v })} />
            <TextRow label="Role" value={item.role} onChange={(v) => list.update(index, { role: v })} />
            <TextRow
              label="Location"
              value={item.location}
              onChange={(v) => list.update(index, { location: v })}
            />
            <TextRow
              label="Image path"
              hint="Optional. Public image path."
              value={item.image}
              onChange={(v) => list.update(index, { image: v })}
            />
          </ListItemShell>
        ))
      )}

      <div>
        <Button variant="outline" size="sm" onClick={() => list.add({ ...EMPTY })}>
          <Plus className="size-4" /> Add testimonial
        </Button>
      </div>

      <SaveBar onSave={() => save(list.items)} pending={pending} note="Changes publish to the Studio page." />
    </div>
  );
}
