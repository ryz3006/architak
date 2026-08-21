export type MediaVisibility = "public" | "private";

export type StorageObjectRef = {
  storageKey: string;
  visibility: MediaVisibility;
};

export type CreateUploadUrlInput = {
  visibility: MediaVisibility;
  /** Path after the visibility prefix, e.g. projects/cover.jpg */
  objectPath: string;
  contentType: string;
  expiresInSeconds?: number;
};

export type CreateUploadUrlResult = {
  uploadUrl: string;
  storageKey: string;
  visibility: MediaVisibility;
};

export type CreateDownloadUrlInput = {
  storageKey: string;
  visibility: MediaVisibility;
  expiresInSeconds?: number;
};

/**
 * Provider-agnostic storage contract.
 * Implementations must enforce public/ vs private/ key prefixes.
 */
export interface StorageService {
  buildStorageKey(visibility: MediaVisibility, objectPath: string): string;
  createUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult>;
  createDownloadUrl(input: CreateDownloadUrlInput): Promise<string>;
  getPublicUrl(storageKey: string): string | null;
  deleteObject(storageKey: string, visibility: MediaVisibility): Promise<void>;
}

export class StorageVisibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageVisibilityError";
  }
}

export function assertKeyMatchesVisibility(
  storageKey: string,
  visibility: MediaVisibility,
): void {
  const expectedPrefix = `${visibility}/`;
  if (!storageKey.startsWith(expectedPrefix)) {
    throw new StorageVisibilityError(
      `storage_key must start with "${expectedPrefix}" for visibility=${visibility}`,
    );
  }
}

export function normalizeObjectPath(objectPath: string): string {
  const cleaned = objectPath.replace(/^\/+/, "").replace(/\.\./g, "");
  if (!cleaned || cleaned.startsWith("public/") || cleaned.startsWith("private/")) {
    throw new StorageVisibilityError(
      "objectPath must be a relative path without a visibility prefix",
    );
  }
  return cleaned;
}
