#!/usr/bin/env node
/**
 * Env parity checker.
 *
 * Prints which configuration names are present or missing. Values are never
 * printed — only their presence and a coarse shape check — so the output is
 * safe to paste into an issue or a CI log.
 *
 * Keep the lists below in sync with the Zod schema in lib/env.ts.
 *
 *   pnpm env:check              # check the current process + .env.local
 *   pnpm env:check --vercel     # print the list to mirror into Vercel
 */

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Required by getServerEnv(); a missing value throws at request time. */
const REQUIRED = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SECRET_KEY",
  "ADMIN_USERNAME",
  "ADMIN_PASSWORD",
  "ADMIN_SESSION_SECRET",
];

/** Has a schema default, but production needs a real value. */
const REQUIRED_FOR_UPLOADS = [
  "CLOUDFLARE_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
];

const OPTIONAL = [
  "NODE_ENV",
  "ADMIN_BASE_PATH",
  "R2_PUBLIC_BASE_URL",
  "CONTACT_PHONE",
  "CONTACT_EMAIL",
  "CONTACT_WHATSAPP",
  "DISCOVERY_AI_CRAWLERS_ALLOW",
  "DISCOVERY_AI_CRAWLERS_DENY",
  "DISCOVERY_LLMS_FULL_ENABLED",
  "DISCOVERY_PUBLIC_API_ENABLED",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX",
  "FEATURE_JOURNAL_NAV",
  "FEATURE_THREE_D",
  "FEATURE_SPLASH_CURSOR",
  "TELEGRAM_NOTIFICATIONS_ENABLED",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "TELEGRAM_NOTIFICATION_TIMEOUT_MS",
  "DATABASE_URL",
  "SUPABASE_DB_PASSWORD",
  "CRON_SECRET",
];

/** Minimum lengths enforced by lib/env.ts, checked here so failures surface early. */
const MIN_LENGTH = {
  ADMIN_PASSWORD: 8,
  ADMIN_SESSION_SECRET: 32,
  CRON_SECRET: 32,
};

const MUST_BE_URL = new Set([
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "R2_ENDPOINT",
  "R2_PUBLIC_BASE_URL",
]);

function parseDotEnv(path) {
  let raw;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return {};
  }

  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return values;
}

function describe(name, value) {
  if (value === undefined || value === "") return { ok: false, note: "missing" };

  const min = MIN_LENGTH[name];
  if (min && value.length < min) {
    return { ok: false, note: `too short (${value.length} chars, needs ${min})` };
  }

  if (MUST_BE_URL.has(name)) {
    try {
      new URL(value);
    } catch {
      return { ok: false, note: "not a valid URL" };
    }
  }

  return { ok: true, note: `set (${value.length} chars)` };
}

function printVercelChecklist() {
  console.log("Mirror these names into Vercel > Settings > Environment Variables");
  console.log("for both Production and Preview. Never commit the values.\n");
  console.log("Required (app throws without these):");
  for (const name of REQUIRED) console.log(`  ${name}`);
  console.log("\nRequired before media uploads work:");
  for (const name of REQUIRED_FOR_UPLOADS) console.log(`  ${name}`);
  console.log("\nOptional (schema defaults apply):");
  for (const name of OPTIONAL) console.log(`  ${name}`);
}

function main() {
  if (process.argv.includes("--vercel")) {
    printVercelChecklist();
    return;
  }

  const fromFile = parseDotEnv(resolve(repoRoot, ".env.local"));
  const resolveValue = (name) => process.env[name] ?? fromFile[name];

  let failures = 0;
  let warnings = 0;

  const groups = [
    { label: "Required", names: REQUIRED, fatal: true },
    { label: "Required for media uploads", names: REQUIRED_FOR_UPLOADS, fatal: false },
    { label: "Optional", names: OPTIONAL, fatal: false },
  ];

  for (const group of groups) {
    console.log(`\n${group.label}`);
    for (const name of group.names) {
      const { ok, note } = describe(name, resolveValue(name));
      if (ok) {
        console.log(`  PASS  ${name} — ${note}`);
      } else if (group.fatal) {
        failures += 1;
        console.log(`  FAIL  ${name} — ${note}`);
      } else {
        warnings += 1;
        console.log(`  WARN  ${name} — ${note}`);
      }
    }
  }

  console.log(
    `\n${failures} blocking issue(s), ${warnings} warning(s). Source: process env + .env.local`,
  );

  if (failures > 0) {
    console.log("Run `pnpm env:check --vercel` for the list to mirror into Vercel.");
    process.exitCode = 1;
  }
}

main();
