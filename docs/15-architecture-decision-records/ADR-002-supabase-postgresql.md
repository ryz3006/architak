# ADR-002: Supabase PostgreSQL with Default RLS

## Context

Need Postgres, auth (later), and type-safe access for CMS and public content. Project name: **`architak-media`**.

## Decision

Use **Supabase PostgreSQL**. Treat **RLS as enabled by default**. Never disable RLS. Ship policies in the same migration as each table. Phase 1: no Drizzle; use Supabase JS + generated types.

## Alternatives

- Neon + Auth.js — more assembly
- Drizzle now — duplicates path until complex transactions need it
- Disable RLS for admin convenience — **rejected** (security)

## Advantages

Managed Postgres, Auth, RLS, dashboard; publishable vs secret key model.

## Trade-offs

Static admin (Phase 1) is not `auth.uid()`; CMS writes use secret key **after** session check.

## Consequences

Empty policies = deny. Document every policy. Secret key never in browser.
