#!/usr/bin/env node
/**
 * Apply the exact production CORS policy to the private R2 bucket.
 * Uses existing S3-compatible credentials — no Cloudflare API token required.
 *
 *   pnpm r2:cors
 */

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function loadLocalEnv() {
  try {
    const raw = readFileSync(resolve(repoRoot, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const name = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (process.env[name] === undefined) process.env[name] = value;
    }
  } catch {
    // optional
  }
}

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  loadLocalEnv();

  const client = new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });

  const origins = [
    "http://localhost:3000",
    "https://architak.vercel.app",
    "https://architak.in",
    "https://www.architak.in",
  ];

  await client.send(
    new PutBucketCorsCommand({
      Bucket: required("R2_BUCKET_NAME"),
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ["GET", "HEAD", "PUT"],
            AllowedHeaders: ["Content-Type", "Range", "x-amz-*"],
            ExposeHeaders: ["Content-Length", "Content-Range", "Content-Type", "ETag", "Last-Modified"],
            MaxAgeSeconds: 86400,
          },
        ],
      },
    }),
  );

  console.log(`CORS applied for ${origins.length} exact origins (no wildcards).`);
}

main().catch((error) => {
  console.error(`r2:cors failed: ${error instanceof Error ? error.message : "unknown"}`);
  process.exitCode = 1;
});
