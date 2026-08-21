#!/usr/bin/env node
/**
 * Apply repo SQL migrations + seed to the remote Supabase Postgres.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=...   (uses NEXT_PUBLIC_SUPABASE_URL project ref)
 *
 * Never prints the password or connection string.
 *
 *   pnpm db:apply
 */

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

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

function projectRefFromUrl(url) {
  const host = new URL(url).hostname;
  const match = /^([a-z0-9]+)\.supabase\.co$/i.exec(host);
  if (!match) throw new Error("NEXT_PUBLIC_SUPABASE_URL host is not *.supabase.co");
  return match[1];
}

function resolveConnectionString() {
  if (process.env.DATABASE_URL?.trim()) return process.env.DATABASE_URL.trim();

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) {
    throw new Error(
      "Set DATABASE_URL or SUPABASE_DB_PASSWORD (with NEXT_PUBLIC_SUPABASE_URL) in .env.local",
    );
  }

  const ref = projectRefFromUrl(supabaseUrl);
  // Direct connection — required for DDL. Pooler transaction mode can break multi-statement SQL.
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function sqlFiles() {
  const migrationsDir = resolve(repoRoot, "supabase/migrations");
  const migrations = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => join(migrationsDir, name));

  const seed = resolve(repoRoot, "supabase/seed.sql");
  return [...migrations, seed];
}

async function main() {
  loadLocalEnv();
  const connectionString = resolveConnectionString();
  const sql = postgres(connectionString, {
    max: 1,
    ssl: "require",
    onnotice: () => undefined,
  });

  const files = sqlFiles();
  console.log(`Applying ${files.length} SQL file(s) to remote Postgres…`);

  try {
    for (const file of files) {
      const body = readFileSync(file, "utf8");
      const label = file.slice(repoRoot.length + 1).replaceAll("\\", "/");
      process.stdout.write(`  → ${label} … `);
      await sql.unsafe(body);
      console.log("ok");
    }

    const tables = await sql`
      select relname as name
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relkind = 'r'
        and c.relrowsecurity = true
      order by relname
    `;
    console.log(`RLS-enabled public tables: ${tables.map((row) => row.name).join(", ")}`);
    console.log("Done.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`db:apply failed: ${message}`);
  process.exitCode = 1;
});
