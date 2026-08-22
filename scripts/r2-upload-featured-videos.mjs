#!/usr/bin/env node

import {
  createReadStream,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const UPLOADS = [
  {
    source: "Library/Works/IMG_7761.MP4",
    key: "public/portfolio/featured/img-7761.mp4",
    localCopy: "public/media/featured-works/img-7761.mp4",
    contentType: "video/mp4",
  },
  {
    source: "Library/Works/IMG_9023.MOV",
    key: "public/portfolio/featured/img-9023.mov",
    localCopy: "public/media/featured-works/img-9023.mov",
    contentType: "video/quicktime",
  },
];

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if (value.startsWith('"')) {
    return value
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\r", "\r")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }
  if (value.startsWith("'")) {
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, "").trim();
}

function loadLocalEnv(path) {
  let contents;
  try {
    contents = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(trimmed);
    if (!match) continue;
    const [, name, rawValue] = match;
    if (name && rawValue !== undefined && process.env[name] === undefined) {
      process.env[name] = parseEnvValue(rawValue);
    }
  }
}

async function main() {
  loadLocalEnv(resolve(repoRoot, ".env.local"));

  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const endpoint = process.env.R2_ENDPOINT?.trim();

  const localDir = resolve(repoRoot, "public/media/featured-works");
  mkdirSync(localDir, { recursive: true });

  let client = null;
  if (accessKeyId && secretAccessKey && bucket && endpoint) {
    client = new S3Client({
      region: "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  } else {
    console.warn("R2 credentials missing — copying videos locally only.");
  }

  for (const item of UPLOADS) {
    const sourcePath = resolve(repoRoot, item.source);
    if (!existsSync(sourcePath)) {
      console.error(`Missing source file: ${item.source}`);
      process.exitCode = 1;
      continue;
    }

    const localPath = resolve(repoRoot, item.localCopy);
    mkdirSync(dirname(localPath), { recursive: true });
    copyFileSync(sourcePath, localPath);
    console.log(`LOCAL ${item.localCopy}`);

    if (!client) continue;

    const head = await client
      .send(new HeadObjectCommand({ Bucket: bucket, Key: item.key }))
      .catch(() => null);
    if (head) {
      console.log(`SKIP (exists) ${item.key}`);
      continue;
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: item.key,
        Body: createReadStream(sourcePath),
        ContentType: item.contentType,
        CacheControl: "public, max-age=3600, s-maxage=86400",
      }),
    );
    console.log(`UPLOADED ${item.key}`);
  }

  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (publicBase) {
    console.log("\nPublic URLs:");
    for (const item of UPLOADS) {
      console.log(`  ${publicBase}/${item.key}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
