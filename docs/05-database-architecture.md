# Database Architecture

## Project

Supabase project / database name: **`architak-media`**.

## RLS (critical)

**Row Level Security is enabled by default.** An empty policy set means **deny**, not open access.

- Never `DISABLE ROW LEVEL SECURITY` to make the app work
- Every migration that creates a table must `ENABLE ROW LEVEL SECURITY` and ship policies in the **same** migration
- Document every policy in this file and `13-security-model.md`

## Applied migrations (repo)

| Migration | Contents |
|-----------|----------|
| `20260821180000_sprint_0b_schema.sql` | CMS + leads + SEO + audit + profiles, with RLS |
| `20260821200000_phase_7_ops_foundation.sql` | clients, engagements, estimates, invoices, vendors, BOM, inventory, engagement_documents — deny-by-default RLS |

Apply to the remote project with `pnpm db:apply` after adding `SUPABASE_DB_PASSWORD` or `DATABASE_URL` to `.env.local` (never commit). Alternates: Supabase SQL editor or `supabase db push`. Order: both migrations under `supabase/migrations/`, then `supabase/seed.sql`.

## Tables

| Table | Notes |
|-------|-------|
| `profiles` | Stub for later Supabase Auth |
| `media_assets` | `visibility` + `storage_key` prefix constraint |
| `project_categories` / `projects` / `project_media` / `project_related` | Public portfolio |
| `pages` / `site_settings` | Copy only — **no secrets** |
| `enquiries` / `enquiry_events` | Lead capture |
| `redirects` / `seo_metadata` | SEO |
| `audit_events` | Admin mutations |
| `clients` / `engagements` / … | Ops foundation — see `docs/18-operations-domain.md` |

## Public policies (anon / authenticated)

- `SELECT` published categories, projects, pages, public media metadata, related published project media, SEO for published subjects
- `INSERT` on `enquiries` for safe columns only (`name`, `email`, `phone`, `message`, `source_page`, `consent`) with `status = 'new'`
- Everything else denied; admin writes use `SUPABASE_SECRET_KEY` after `requireAdminSession()`

## Client usage

| Client | Key | RLS |
|--------|-----|-----|
| Public / browser | Publishable | Enforced |
| Admin server (after session) | `SUPABASE_SECRET_KEY` | Bypasses — session check is the gate |

Types: `lib/supabase/database.types.ts` (hand-maintained until `supabase gen types` is available).
