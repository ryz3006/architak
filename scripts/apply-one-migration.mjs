#!/usr/bin/env node
/**
 * Apply a single migration file to remote Postgres.
 * Usage: node scripts/apply-one-migration.mjs supabase/migrations/....sql
 */
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = process.argv[2];
if (!target) {
  console.error("Usage: node scripts/apply-one-migration.mjs <path-to.sql>");
  process.exit(1);
}

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
    throw new Error("Set DATABASE_URL or SUPABASE_DB_PASSWORD + NEXT_PUBLIC_SUPABASE_URL");
  }
  const ref = projectRefFromUrl(supabaseUrl);
  const region = process.env.SUPABASE_POOLER_REGION?.trim();
  try {
    const sql = await canConnect(
      `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`,
    );
    console.log("Connected via direct database host.");
    return sql;
  } catch (directError) {
    if (!region) throw directError;
    console.log(`Direct DB host unreachable; falling back to pooler (${region}).`);
    return canConnect(
      `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:5432/postgres`,
    );
  }
}

async function main() {
  loadLocalEnv();
  const sql = await resolveSqlClient();
  const file = resolve(repoRoot, target);
  const body = readFileSync(file, "utf8");
  const label = file.slice(repoRoot.length + 1).replaceAll("\\", "/");
  try {
    process.stdout.write(`Applying ${label} … `);
    await sql.unsafe(body);
    console.log("ok");

    const check = await sql`
      select
        exists(
          select 1 from information_schema.tables
          where table_schema = 'public' and table_name = 'page_views'
        ) as page_views_table,
        exists(
          select 1 from pg_proc p
          join pg_namespace n on n.oid = p.pronamespace
          where n.nspname = 'public' and p.proname = 'page_views_relation_bytes'
        ) as page_views_bytes_fn,
        (
          select c.relrowsecurity
          from pg_class c
          join pg_namespace n on n.oid = c.relnamespace
          where n.nspname = 'public' and c.relname = 'page_views'
        ) as rls_enabled
    `;
    console.log(check[0]);
    console.log("Done.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(`apply-one-migration failed: ${error instanceof Error ? error.message : "unknown"}`);
  process.exitCode = 1;
});
