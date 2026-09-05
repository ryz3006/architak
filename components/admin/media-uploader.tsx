"use client";

import { useCallback, useRef, useState } from "react";

import { ACCEPT_ATTR, formatBytes, supportedFormatsLabel } from "@/features/media/capabilities";
import { validateBatchQuota, validateMediaFile } from "@/features/media/validation";

type UploadItem = {
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  message?: string;
};

export function MediaUploader({
  currentUsageBytes,
  onComplete,
}: {
  currentUsageBytes: number;
  onComplete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setError("");
      const batch = validateBatchQuota(
        currentUsageBytes,
        list.map((f) => f.size),
      );
      if (!batch.ok) {
        setError(batch.message);
        return;
      }

      setBusy(true);
      setItems(list.map((f) => ({ name: f.name, status: "pending" })));

      for (let i = 0; i < list.length; i += 1) {
        const file = list[i]!;
        setItems((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: "uploading" } : item)),
        );

        const validated = await validateMediaFile(file);
        if (!validated.ok) {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error", message: validated.message } : item,
            ),
          );
          continue;
        }

        try {
          const prep = await fetch("/api/admin/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "upload-url",
              filename: file.name,
              contentType: validated.mimeType,
              byteSize: file.size,
              visibility: "public",
            }),
          });
          const prepJson = (await prep.json()) as {
            ok: boolean;
            message?: string;
            uploadUrl?: string;
            mediaAssetId?: string;
          };

          if (!prepJson.ok || !prepJson.uploadUrl || !prepJson.mediaAssetId) {
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? { ...item, status: "error", message: prepJson.message || "Upload rejected." }
                  : item,
              ),
            );
            continue;
          }

          const put = await fetch(prepJson.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": validated.mimeType },
            body: file,
          });

          if (!put.ok) {
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === i ? { ...item, status: "error", message: "Transfer to storage failed." } : item,
              ),
            );
            continue;
          }

          await fetch("/api/admin/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "confirm", mediaAssetId: prepJson.mediaAssetId }),
          });

          setItems((prev) =>
            prev.map((item, idx) => (idx === i ? { ...item, status: "done" } : item)),
          );
        } catch {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === i ? { ...item, status: "error", message: "Unexpected upload error." } : item,
            ),
          );
        }
      }

      setBusy(false);
      onComplete();
    },
    [currentUsageBytes, onComplete],
  );

  return (
    <div className="border border-border p-5">
      <p className="text-fluid-xs tracking-widest text-muted uppercase">Upload</p>
      <p className="mt-2 text-fluid-sm text-muted">
        Images: {supportedFormatsLabel("image")}. Videos: {supportedFormatsLabel("video")}.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="sr-only"
        onChange={(event) => {
          if (event.target.files) void uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="mt-4 min-h-11 border border-foreground bg-foreground px-5 py-2 text-fluid-sm tracking-widest text-background uppercase disabled:opacity-50"
      >
        {busy ? "Uploading…" : "Select files"}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-fluid-sm text-red-300">
          {error}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.name + item.status} className="text-fluid-sm">
              <span className="text-foreground">{item.name}</span>
              <span className="ml-2 text-muted">
                {item.status === "done"
                  ? "✓"
                  : item.status === "error"
                    ? item.message
                    : item.status === "uploading"
                      ? "Uploading…"
                      : "Waiting"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-fluid-xs text-muted">Max per file shown in validation · Quota enforced before transfer.</p>
      <p className="sr-only">{formatBytes(currentUsageBytes)} currently used</p>
    </div>
  );
}
