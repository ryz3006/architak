#!/usr/bin/env node
/**
 * Deploy the public-only media Worker and print follow-up DNS checks.
 *
 * Requires:
 *   CLOUDFLARE_API_TOKEN   (Workers + R2 + Zone edit for architak.in)
 *   CLOUDFLARE_ACCOUNT_ID  (already in .env.local)
 *
 *   pnpm media:worker:deploy
 */

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workerDir = resolve(repoRoot, "cloudflare/media-worker");
const configPath = resolve(workerDir, "wrangler.toml");
const wranglerBin = resolve(
  repoRoot,
  "node_modules/wrangler/bin/wrangler.js",
);

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

function main() {
  loadLocalEnv();

  if (!process.env.CLOUDFLARE_API_TOKEN?.trim()) {
    throw new Error("Set CLOUDFLARE_API_TOKEN in .env.local (Workers Edit + R2 + Zone DNS)");
  }
  if (!process.env.CLOUDFLARE_ACCOUNT_ID?.trim()) {
    throw new Error("Set CLOUDFLARE_ACCOUNT_ID in .env.local");
  }
  if (!existsSync(configPath)) {
    throw new Error(`Missing Worker config at ${configPath}`);
  }
  if (!existsSync(wranglerBin)) {
    throw new Error("wrangler is not installed — run pnpm install");
  }

  console.log("Deploying architak-media Worker…");
  const result = spawnSync(
    process.execPath,
    [wranglerBin, "deploy", "--config", configPath],
    {
      cwd: workerDir,
      env: {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
        WRANGLER_SEND_METRICS: "false",
        CI: "true",
      },
      stdio: "inherit",
      shell: false,
    },
  );

  if (result.status !== 0) {
    process.exitCode = result.status ?? 1;
    return;
  }

  console.log(`
Next checks (no secrets):
  1. Cloudflare → Workers → architak-media → Custom Domains includes media.architak.in
  2. DNS for media.architak.in should be managed by the Worker custom domain binding
  3. After a public object exists:
       curl -I https://media.architak.in/public/projects/.keep
     Expect 200/404 from the Worker, never a private-key listing
  4. curl -I https://media.architak.in/private/clients/.keep
     Expect 404
`);
}

try {
  main();
} catch (error) {
  console.error(`media:worker:deploy failed: ${error instanceof Error ? error.message : "unknown"}`);
  process.exitCode = 1;
}
