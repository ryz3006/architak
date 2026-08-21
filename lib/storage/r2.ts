import {
  DeleteObjectCommand,
  PutObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { getServerEnv, isR2Configured } from "@/lib/env";
import {
  assertKeyMatchesVisibility,
  normalizeObjectPath,
  type CreateDownloadUrlInput,
  type CreateUploadUrlInput,
  type CreateUploadUrlResult,
  type MediaVisibility,
  type StorageService,
  StorageVisibilityError,
} from "@/lib/storage/types";

function getR2Client(): S3Client {
  const env = getServerEnv();
  if (!isR2Configured()) {
    throw new Error(
      "R2 is not fully configured. Set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_ENDPOINT.",
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
    },
  });
}

/**
 * Cloudflare R2 adapter.
 * Bucket stays private. Public delivery uses R2_PUBLIC_BASE_URL for public/ keys only.
 */
export class R2StorageService implements StorageService {
  buildStorageKey(visibility: MediaVisibility, objectPath: string): string {
    return `${visibility}/${normalizeObjectPath(objectPath)}`;
  }

  async createUploadUrl(input: CreateUploadUrlInput): Promise<CreateUploadUrlResult> {
    const env = getServerEnv();
    const storageKey = this.buildStorageKey(input.visibility, input.objectPath);
    assertKeyMatchesVisibility(storageKey, input.visibility);

    const client = getR2Client();
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: storageKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: input.expiresInSeconds ?? 600,
    });

    return {
      uploadUrl,
      storageKey,
      visibility: input.visibility,
    };
  }

  async createDownloadUrl(input: CreateDownloadUrlInput): Promise<string> {
    assertKeyMatchesVisibility(input.storageKey, input.visibility);

    if (input.visibility === "public") {
      const publicUrl = this.getPublicUrl(input.storageKey);
      if (publicUrl) {
        return publicUrl;
      }
    }

    const env = getServerEnv();
    const client = getR2Client();
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.storageKey,
    });

    return getSignedUrl(client, command, {
      expiresIn: input.expiresInSeconds ?? 300,
    });
  }

  getPublicUrl(storageKey: string): string | null {
    assertKeyMatchesVisibility(storageKey, "public");
    const env = getServerEnv();
    const base = env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
    if (!base) {
      return null;
    }
    // CDN must only ever expose public/ — never rewrite private keys here.
    return `${base}/${storageKey}`;
  }

  async deleteObject(storageKey: string, visibility: MediaVisibility): Promise<void> {
    assertKeyMatchesVisibility(storageKey, visibility);
    const env = getServerEnv();
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: storageKey,
      }),
    );
  }
}

/** Stub used when R2 credentials are absent — fails loudly on network ops. */
export class UnconfiguredStorageService implements StorageService {
  buildStorageKey(visibility: MediaVisibility, objectPath: string): string {
    return `${visibility}/${normalizeObjectPath(objectPath)}`;
  }

  async createUploadUrl(): Promise<CreateUploadUrlResult> {
    throw new StorageVisibilityError("R2 is not configured");
  }

  async createDownloadUrl(): Promise<string> {
    throw new StorageVisibilityError("R2 is not configured");
  }

  getPublicUrl(): string | null {
    return null;
  }

  async deleteObject(): Promise<void> {
    throw new StorageVisibilityError("R2 is not configured");
  }
}

export function getStorageService(): StorageService {
  if (isR2Configured()) {
    return new R2StorageService();
  }
  return new UnconfiguredStorageService();
}
