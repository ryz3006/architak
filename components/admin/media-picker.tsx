"use client";

import { ImageIcon, Search, Video, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/admin/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/admin/ui/dialog";
import { Input } from "@/components/admin/ui/input";
import { cn } from "@/lib/cn";
import { formatBytes } from "@/features/media/capabilities";

export type PickerMediaAsset = {
  id: string;
  storage_key: string;
  mime_type: string;
  byte_size: number;
  alt_text: string | null;
  publicUrl: string | null;
  kind: "image" | "video" | "other";
};

export type MediaPickerValue = {
  id: string;
  /** CDN or absolute public URL when available. */
  publicUrl: string | null;
  /** Full storage key including visibility prefix, e.g. public/uploads/... */
  storageKey: string;
  /** Path relative to the public/ prefix — used for R2 objectPath fields. */
  objectPath: string;
  mimeType: string;
  kind: "image" | "video" | "other";
  label: string;
};

function toPickerValue(asset: PickerMediaAsset): MediaPickerValue {
  const objectPath = asset.storage_key.replace(/^public\//, "").replace(/^private\//, "");
  const label =
    asset.alt_text?.trim() ||
    asset.storage_key.split("/").pop() ||
    asset.storage_key;

  return {
    id: asset.id,
    publicUrl: asset.publicUrl,
    storageKey: asset.storage_key,
    objectPath,
    mimeType: asset.mime_type,
    kind: asset.kind,
    label,
  };
}

/**
 * Gallery picker dialog. Lets editors choose an existing media asset instead of
 * typing storage paths by hand.
 */
export function MediaPickerDialog({
  open,
  onOpenChange,
  kind = "all",
  title = "Choose from gallery",
  description = "Select an uploaded asset. Upload new files in Gallery first if needed.",
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind?: "image" | "video" | "all";
  title?: string;
  description?: string;
  onSelect: (value: MediaPickerValue) => void;
}) {
  const [assets, setAssets] = useState<PickerMediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (kind !== "all") params.set("kind", kind);
      if (search.trim()) params.set("search", search.trim());
      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = (await res.json()) as {
        ok?: boolean;
        assets?: PickerMediaAsset[];
        message?: string;
      };
      if (!res.ok || !json.ok) {
        setError(json.message || "Could not load gallery.");
        setAssets([]);
        return;
      }
      setAssets(json.assets ?? []);
    } catch {
      setError("Could not load gallery.");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [kind, search]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void load();
    }, search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [open, load, search]);

  const filtered = useMemo(() => {
    return assets.filter((asset) => asset.kind === "image" || asset.kind === "video");
  }, [assets]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85dvh] w-[min(44rem,calc(100vw-1.5rem))] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-[var(--admin-border)] px-5 py-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="border-b border-[var(--admin-border)] px-5 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search filename or alt text"
              className="pl-9"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="py-10 text-center text-fluid-sm text-muted">Loading gallery…</p>
          ) : error ? (
            <p role="alert" className="py-10 text-center text-fluid-sm text-[var(--admin-danger)]">
              {error}
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-fluid-sm text-muted">
              No matching assets. Upload files in Gallery first.
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {filtered.map((asset) => {
                const filename = asset.storage_key.split("/").pop() ?? asset.storage_key;
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full flex-col overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] text-left transition-colors",
                        "hover:border-[var(--admin-border-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                      )}
                      onClick={() => {
                        onSelect(toPickerValue(asset));
                        onOpenChange(false);
                      }}
                    >
                      <div className="relative aspect-[4/3] bg-[var(--admin-surface)]">
                        {asset.kind === "image" && asset.publicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin picker; CDN URLs may 404
                          <img
                            src={asset.publicUrl}
                            alt={asset.alt_text || filename}
                            className="h-full w-full object-cover"
                            loading="lazy"
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
                          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted">
                            {asset.kind === "video" ? (
                              <Video className="size-5" aria-hidden="true" />
                            ) : (
                              <ImageIcon className="size-5" aria-hidden="true" />
                            )}
                            <span className="text-fluid-xs">No preview</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 p-2.5">
                        <span className="truncate text-fluid-xs text-foreground">{filename}</span>
                        <span className="text-[0.65rem] text-muted">
                          {asset.kind} · {formatBytes(asset.byte_size)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Compact field that shows the current path/URL and opens the gallery picker. */
export function MediaPathField({
  label,
  hint,
  value,
  displayValue,
  kind = "all",
  onPick,
  onClear,
  pickerTitle,
}: {
  label: string;
  hint?: string;
  value: string;
  /** Optional friendlier text under the value (e.g. filename). */
  displayValue?: string;
  kind?: "image" | "video" | "all";
  onPick: (picked: MediaPickerValue) => void;
  onClear?: () => void;
  pickerTitle?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-fluid-sm font-medium text-foreground">{label}</span>
        {value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-fluid-xs text-muted hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" /> Clear
          </button>
        ) : null}
      </div>
      {hint ? <p className="text-fluid-xs text-muted">{hint}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2">
          {value ? (
            <p className="truncate text-fluid-sm text-foreground" title={value}>
              {displayValue || value}
            </p>
          ) : (
            <p className="text-fluid-sm text-muted">Nothing selected</p>
          )}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Choose…
        </Button>
      </div>

      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        kind={kind}
        title={pickerTitle ?? label}
        onSelect={onPick}
      />
    </div>
  );
}
