"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { MediaUploader } from "@/components/admin/media-uploader";
import { StorageBar } from "@/components/admin/storage-bar";
import { formatBytes } from "@/features/media/capabilities";
import type { AdminMediaAsset, MediaUsage } from "@/features/media/admin";
import type { StorageUsage } from "@/features/media/storage-accounting";

export function GalleryClient({
  initialAssets,
  usage,
}: {
  initialAssets: AdminMediaAsset[];
  usage: StorageUsage;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [selected, setSelected] = useState<AdminMediaAsset | null>(null);
  const [usages, setUsages] = useState<MediaUsage[]>([]);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    return initialAssets.filter((asset) => {
      if (kind !== "all" && asset.kind !== kind) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        asset.storage_key.toLowerCase().includes(q) ||
        (asset.alt_text?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [initialAssets, kind, search]);

  async function openManage(asset: AdminMediaAsset) {
    setSelected(asset);
    setMessage("");
    const res = await fetch(`/api/admin/media/${asset.id}`);
    const json = (await res.json()) as { ok: boolean; usages?: MediaUsage[] };
    setUsages(json.usages ?? []);
  }

  async function deleteSelected(force = false) {
    if (!selected) return;
    const res = await fetch(`/api/admin/media/${selected.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force }),
    });
    const json = (await res.json()) as {
      ok: boolean;
      message: string;
      usages?: MediaUsage[];
    };
    if (!json.ok) {
      setMessage(json.message);
      if (json.usages) setUsages(json.usages);
      return;
    }
    setSelected(null);
    startTransition(() => router.refresh());
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      <StorageBar usage={usage} />
      <MediaUploader
        currentUsageBytes={usage.totalBytes}
        onComplete={() => startTransition(() => router.refresh())}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2">
          <span className="text-fluid-xs tracking-widest text-muted uppercase">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-h-11 border border-border bg-surface px-4 py-2 outline-none focus:border-accent"
            placeholder="Filename or alt text"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-fluid-xs tracking-widest text-muted uppercase">Type</span>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as typeof kind)}
            className="min-h-11 border border-border bg-surface px-4 py-2"
          >
            <option value="all">All</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-border p-8">
          <h2 className="display text-fluid-xl">No media yet</h2>
          <p className="measure mt-3 text-muted">
            Upload images or videos to build the gallery. Supported formats are validated before
            transfer.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(16rem,100%),1fr))]">
          {filtered.map((asset) => (
            <li key={asset.id} className="flex flex-col border border-border">
              <div className="relative aspect-[4/3] bg-surface">
                {asset.kind === "image" && asset.publicUrl ? (
                  <Image
                    src={asset.publicUrl}
                    alt={asset.alt_text || asset.storage_key}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                ) : asset.kind === "video" && asset.publicUrl ? (
                  <video
                    src={asset.publicUrl}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-fluid-xs text-muted">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="truncate text-fluid-sm">{asset.storage_key.split("/").pop()}</p>
                <p className="text-fluid-xs text-muted">
                  {asset.kind} · {formatBytes(asset.byte_size)}
                </p>
                <button
                  type="button"
                  className="mt-auto min-h-11 border border-border px-3 py-2 text-fluid-xs tracking-widest uppercase hover:border-accent"
                  onClick={() => void openManage(asset)}
                >
                  Manage
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Manage media"
          className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-background/80 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90dvh] w-full max-w-lg overflow-y-auto border border-border bg-surface p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="display text-display-sm">Manage asset</h2>
            <p className="mt-2 break-all text-fluid-sm text-muted">{selected.storage_key}</p>
            <p className="mt-4 text-fluid-xs tracking-widest text-muted uppercase">Used by</p>
            {usages.length === 0 ? (
              <p className="mt-2 text-fluid-sm text-muted">Not referenced. Safe to delete.</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {usages.map((usage) => (
                  <li key={usage.label} className="text-fluid-sm">
                    ✓ {usage.label}
                  </li>
                ))}
              </ul>
            )}
            {message ? (
              <p role="alert" className="mt-4 text-fluid-sm text-red-300">
                {message}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="min-h-11 border border-red-300/50 px-4 py-2 text-fluid-xs tracking-widest text-red-300 uppercase"
                onClick={() => void deleteSelected(usages.length > 0)}
                disabled={pending}
              >
                {usages.length > 0 ? "Replace refs & delete" : "Delete"}
              </button>
              <button
                type="button"
                className="min-h-11 border border-border px-4 py-2 text-fluid-xs tracking-widest uppercase"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
