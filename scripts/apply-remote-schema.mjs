#!/usr/bin/env node
/**
 * Apply repo SQL migrations + seed to the remote Supabase Postgres.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://...
 *   SUPABASE_DB_PASSWORD=...   (with NEXT_PUBLIC_SUPABASE_URL)
 *
 * Optional:
 *   SUPABASE_POOLER_REGION=ap-northeast-1
 *     Used when the direct db.*.supabase.co host is IPv6-only / unreachable.
 *     Session-mode pooler (port 5432) is used so multi-statement DDL still works.
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

function directConnectionString(ref, password) {
  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

function poolerConnectionString(ref, password, region) {
  // Session mode (5432) — required for multi-statement migrations.
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres`;
}

async function canConnect(connectionString) {
  const sql = postgres(connectionString, {
    max: 1,
    ssl: "require",
    connect_timeout: 8,
    onnotice: () => undefined,
  });
  try {
    await sql`select 1`;
    return sql;
  } catch (error) {
    try {
      await sql.end({ timeout: 1 });
    } catch {
      // ignore
    }
    throw error;
  }
}

async function resolveSqlClient() {
  if (process.env.DATABASE_URL?.trim()) {
    return canConnect(process.env.DATABASE_URL.trim());
  }

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) {
    throw new Error(
      "Set DATABASE_URL or SUPABASE_DB_PASSWORD (with NEXT_PUBLIC_SUPABASE_URL) in .env.local",
    );
  }

  const ref = projectRefFromUrl(supabaseUrl);
  const region = process.env.SUPABASE_POOLER_REGION?.trim();

  // Prefer direct when reachable (IPv6 / IPv4 add-on).
  try {
    const sql = await canConnect(directConnectionString(ref, password));
    console.log("Connected via direct database host.");
    return sql;
  } catch (directError) {
    const directMsg = directError instanceof Error ? directError.message : String(directError);
    if (!region) {
      throw new Error(
        `Direct DB host unreachable (${directMsg}). Set SUPABASE_POOLER_REGION (e.g. ap-northeast-1) or DATABASE_URL for the session-mode pooler.`,
      );
    }
    console.log(`Direct DB host unreachable; falling back to pooler (${region}, session mode).`);
    return canConnect(poolerConnectionString(ref, password, region));
  }
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
  const sql = await resolveSqlClient();

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

    const extensions = await sql`
      select
        exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'seo_versions') as seo_versions,
        exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'project_testimonials') as project_testimonials,
        exists(
          select 1 from pg_constraint
          where conname = 'enquiries_status_check'
            and pg_get_constraintdef(oid) like '%in_discussion%'
        ) as enquiry_statuses_extended
    `;
    const row = extensions[0];
    console.log(
      `Admin platform: seo_versions=${row.seo_versions} project_testimonials=${row.project_testimonials} enquiry_statuses_extended=${row.enquiry_statuses_extended}`,
    );
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
