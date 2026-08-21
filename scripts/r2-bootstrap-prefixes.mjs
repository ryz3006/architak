#!/usr/bin/env node

import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const verifyOnly = process.argv.includes("--verify-only");
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== "--verify-only");

if (unknownArgs.length > 0) {
  console.error("Usage: node scripts/r2-bootstrap-prefixes.mjs [--verify-only]");
  process.exit(2);
}

const KEEP_KEYS = [
  "public/projects/.keep",
  "public/portfolio/.keep",
  "public/documents/.keep",
  "private/clients/.keep",
  "private/invoices/.keep",
  "private/bom/.keep",
  "private/drawings/.keep",
  "private/vendors/.keep",
];

class ConfigError extends Error {
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
}

function parseEnvValue(rawValue) {
  const value = rawValue.trim();
  if (value.startsWith('"')) {
    if (!value.endsWith('"')) throw new ConfigError("Invalid quoted value in .env.local");
    return value
      .slice(1, -1)
      .replaceAll("\\n", "\n")
      .replaceAll("\\r", "\r")
      .replaceAll('\\"', '"')
      .replaceAll("\\\\", "\\");
  }
  if (value.startsWith("'")) {
    if (!value.endsWith("'")) throw new ConfigError("Invalid quoted value in .env.local");
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, "").trim();
}

function loadLocalEnv(path) {
  let contents;
  try {
    contents = readFileSync(path, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
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

function requiredEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new ConfigError(`Missing required environment variable: ${name}`);
  return value;
}

function isNotFound(error) {
  if (!error || typeof error !== "object") return false;
  const status =
    "$metadata" in error &&
    error.$metadata &&
    typeof error.$metadata === "object" &&
    "httpStatusCode" in error.$metadata
      ? error.$metadata.httpStatusCode
      : undefined;
  return status === 404 || ("name" in error && error.name === "NotFound");
}

function safeErrorSummary(error) {
  if (error instanceof ConfigError) return error.message;
  if (!error || typeof error !== "object") return "Unknown error";
  const name = "name" in error && typeof error.name === "string" ? error.name : "Error";
  const status =
    "$metadata" in error &&
    error.$metadata &&
    typeof error.$metadata === "object" &&
    "httpStatusCode" in error.$metadata &&
    typeof error.$metadata.httpStatusCode === "number"
      ? ` (HTTP ${error.$metadata.httpStatusCode})`
      : "";
  return `${name}${status}`;
}

async function exists(client, bucket, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
}

async function main() {
  loadLocalEnv(resolve(repoRoot, ".env.local"));

  const accountId = requiredEnv("CLOUDFLARE_ACCOUNT_ID");
  const accessKeyId = requiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = requiredEnv("R2_SECRET_ACCESS_KEY");
  const bucket = requiredEnv("R2_BUCKET_NAME");
  const endpoint = requiredEnv("R2_ENDPOINT");

  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    throw new ConfigError("R2_ENDPOINT must be a valid URL");
  }
  if (endpointUrl.protocol !== "https:" || endpointUrl.username || endpointUrl.password) {
    throw new ConfigError("R2_ENDPOINT must be an HTTPS URL without embedded credentials");
  }
  if (!endpointUrl.hostname.startsWith(`${accountId}.`)) {
    throw new ConfigError("R2_ENDPOINT does not match CLOUDFLARE_ACCOUNT_ID");
  }

  const client = new S3Client({
    region: "auto",
    endpoint: endpointUrl.toString(),
    credentials: { accessKeyId, secretAccessKey },
  });

  let created = 0;
  for (const key of KEEP_KEYS) {
    const present = await exists(client, bucket, key);
    if (!present && verifyOnly) {
      console.error(`MISSING ${key}`);
      continue;
    }
    if (!present) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: new Uint8Array(0),
          ContentType: "application/octet-stream",
        }),
      );
      created += 1;
    }

    if (!(await exists(client, bucket, key))) {
      throw new Error(`Verification failed for ${key}`);
    }
    console.log(`${present ? "PRESENT" : "CREATED"} ${key}`);
  }

  const missing = (
    await Promise.all(KEEP_KEYS.map(async (key) => ((await exists(client, bucket, key)) ? null : key)))
  ).filter(Boolean);

  if (missing.length > 0) {
    console.error(`Verification failed: ${missing.length} required object(s) missing.`);
    process.exitCode = 1;
    return;
  }

  console.log(
    verifyOnly
      ? `Verified ${KEEP_KEYS.length} R2 prefix marker objects.`
      : `Verified ${KEEP_KEYS.length} R2 prefix marker objects (${created} created).`,
  );
}

main().catch((error) => {
  console.error(`R2 bootstrap failed: ${safeErrorSummary(error)}`);
  process.exitCode = 1;
});
