"use client";

import { useCallback, useRef, useState } from "react";

import { useAdminLoading } from "@/components/admin/loading";
import { ACCEPT_ATTR, formatBytes, supportedFormatsLabel } from "@/features/media/capabilities";
import { validateBatchQuota, validateMediaFile } from "@/features/media/validation";

type UploadItem = {
  name: string;
  status: "pending" | "uploading" | "done" | "error";
  message?: string;
};

async function abortMediaAsset(mediaAssetId: string): Promise<void> {
  try {
    await fetch(`/api/admin/media/${mediaAssetId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force: true }),
    });
  } catch {
    // Best-effort cleanup of orphaned DB rows.
  }
}

function transferErrorMessage(error: unknown): string {
  if (error instanceof TypeError) {
    return "Could not reach storage (often an R2 CORS issue). Allow PUT from this site’s origin.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Unexpected upload error.";
}

export function MediaUploader({
  currentUsageBytes,
  onComplete,
}: {
  currentUsageBytes: number;
  onComplete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { withLoading } = useAdminLoading();
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

      let anySucceeded = false;

      await withLoading(async () => {
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

          let mediaAssetId: string | undefined;

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

            mediaAssetId = prepJson.mediaAssetId;

            const put = await fetch(prepJson.uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": validated.mimeType },
              body: file,
            });

            if (!put.ok) {
              await abortMediaAsset(mediaAssetId);
              setItems((prev) =>
                prev.map((item, idx) =>
                  idx === i
                    ? {
                        ...item,
                        status: "error",
                        message: `Transfer to storage failed (${put.status}).`,
                      }
                    : item,
                ),
              );
              continue;
            }

            const confirm = await fetch("/api/admin/media", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "confirm", mediaAssetId }),
            });
            const confirmJson = (await confirm.json()) as { ok?: boolean; message?: string };
            if (!confirm.ok || !confirmJson.ok) {
              await abortMediaAsset(mediaAssetId);
              setItems((prev) =>
                prev.map((item, idx) =>
                  idx === i
                    ? {
                        ...item,
                        status: "error",
                        message: confirmJson.message || "Could not confirm upload.",
                      }
                    : item,
                ),
              );
              continue;
            }

            anySucceeded = true;
            setItems((prev) =>
              prev.map((item, idx) => (idx === i ? { ...item, status: "done" } : item)),
            );
          } catch (err) {
            if (mediaAssetId) await abortMediaAsset(mediaAssetId);
            setItems((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? { ...item, status: "error", message: transferErrorMessage(err) }
                  : item,
              ),
            );
          }
        }
      }, "media-upload");

      setBusy(false);
      if (anySucceeded) onComplete();
    },
    [currentUsageBytes, onComplete, withLoading],
  );

  return (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] p-5">
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
        <p role="alert" className="mt-3 text-fluid-sm text-[var(--admin-danger)]">
          {error}
        </p>
      ) : null}
      {items.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={`${item.name}-${index}`} className="text-fluid-sm">
              <span className="text-foreground">{item.name}</span>
              <span
                className={
                  item.status === "error"
                    ? "ml-2 text-[var(--admin-danger)]"
                    : item.status === "done"
                      ? "ml-2 text-[var(--admin-success)]"
                      : "ml-2 text-muted"
                }
              >
                {item.status === "done"
                  ? "Uploaded"
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
      <p className="mt-3 text-fluid-xs text-muted">
        Max per file shown in validation · Quota enforced before transfer.
      </p>
      <p className="sr-only">{formatBytes(currentUsageBytes)} currently used</p>
    </div>
  );
}
