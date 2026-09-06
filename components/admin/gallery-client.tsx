"use client";

import { ImageIcon, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { MediaUploader } from "@/components/admin/media-uploader";
import { StorageBar } from "@/components/admin/storage-bar";
import { useAdminLoading } from "@/components/admin/loading";
import { Badge } from "@/components/admin/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/admin/ui/dialog";
import { formatBytes } from "@/features/media/capabilities";
import type { AdminMediaAsset, MediaUsage } from "@/features/media/admin";
import type { StorageUsage } from "@/features/media/storage-accounting";

function GalleryThumb({ asset }: { asset: AdminMediaAsset }) {
  const [broken, setBroken] = useState(false);
  const incomplete = asset.pendingUpload || asset.byte_size <= 0;

  function bindError(node: HTMLImageElement | HTMLVideoElement | null) {
    if (!node) return;
    node.onerror = () => setBroken(true);
  }

  if (!asset.publicUrl || broken) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-[var(--admin-surface)] px-3 text-center text-fluid-xs text-muted">
        {asset.kind === "video" ? (
          <Video className="size-5" aria-hidden="true" />
        ) : (
          <ImageIcon className="size-5" aria-hidden="true" />
        )}
        <span>{broken ? "Preview unavailable" : "No preview"}</span>
        {incomplete ? <Badge variant="warning">Incomplete</Badge> : null}
      </div>
    );
  }

  if (asset.kind === "video") {
    return (
      <video
        key={asset.publicUrl}
        ref={bindError}
        src={asset.publicUrl}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- admin gallery; avoid optimizer failures on missing CDN objects
    <img
      key={asset.publicUrl}
      ref={bindError}
      src={asset.publicUrl}
      alt={asset.alt_text || asset.storage_key.split("/").pop() || "Media"}
      className="h-full w-full object-cover"
      loading="lazy"
    />
  );
}

export function GalleryClient({
  initialAssets,
  usage,
}: {
  initialAssets: AdminMediaAsset[];
  usage: StorageUsage;
}) {
  const router = useRouter();
  const { withLoading } = useAdminLoading();
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
    await withLoading(async () => {
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
    }, "media-delete");
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
              <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                <GalleryThumb asset={asset} />
                {asset.byte_size <= 0 ? (
                  <span className="absolute top-2 left-2">
                    <Badge variant="warning">0 B</Badge>
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="truncate text-fluid-sm">{asset.storage_key.split("/").pop()}</p>
                <p className="text-fluid-xs text-muted">
                  {asset.kind} · {formatBytes(asset.byte_size)}
                  {asset.storage_key.startsWith("public/legacy/") ? " · local seed" : ""}
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
        <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage asset</DialogTitle>
              <DialogDescription className="break-all">{selected.storage_key}</DialogDescription>
            </DialogHeader>
            {selected.publicUrl ? (
              <p className="break-all text-fluid-xs text-muted">{selected.publicUrl}</p>
            ) : null}
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
              <p role="alert" className="mt-4 text-fluid-sm text-[var(--admin-danger)]">
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
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
