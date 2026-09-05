"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";

export function useListState<T>(initial: T[]) {
  const [items, setItems] = useState<T[]>(initial);

  function update(index: number, patch: Partial<T>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }
  function add(item: T) {
    setItems((current) => [...current, item]);
  }
  function remove(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }
  function move(index: number, direction: -1 | 1) {
    setItems((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  return { items, setItems, update, add, remove, move };
}

export function ListItemShell({
  title,
  index,
  count,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  count: number;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-fluid-sm font-medium text-foreground">{title}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label="Move up"
            className="rounded-[var(--admin-radius-sm)] p-1.5 text-muted hover:bg-[var(--admin-surface)] disabled:opacity-40"
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === count - 1}
            aria-label="Move down"
            className="rounded-[var(--admin-radius-sm)] p-1.5 text-muted hover:bg-[var(--admin-surface)] disabled:opacity-40"
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove"
            className="rounded-[var(--admin-radius-sm)] p-1.5 text-[var(--admin-danger)] hover:bg-[var(--admin-surface)]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}
