# Database Architecture

## Project

Supabase project / database name: **`architak-media`**.

## RLS (critical)

**Row Level Security is enabled by default.** An empty policy set means **deny**, not open access.

- Never `DISABLE ROW LEVEL SECURITY` to make the app work
- Every migration that creates a table must `ENABLE ROW LEVEL SECURITY` and ship policies in the **same** migration
- Document every policy in this file and `13-security-model.md`

## Planned tables (Phase 3–5)

| Table | Notes |
|-------|-------|
| `profiles` | Phase 5 — 1:1 with `auth.users`, `role` |
| `media_assets` | `visibility` (`public` \| `private`), `storage_key` prefixed `public/` or `private/` |
| `project_categories` | Taxonomy |
| `projects` | Public portfolio (not operational jobs) |
| `project_media` | Ordering, captions → `media_assets` |
| `project_related` | Related projects |
| `testimonials` | Optional until real content |
| `pages` / `site_settings` | Studio/Services copy — **no secrets** |
| `enquiries` + `enquiry_events` | Lead capture + status history |
| `redirects` | SEO redirects |
| `seo_metadata` | Polymorphic; includes `ai_summary` |
| `audit_events` | Phase 5 admin mutations |

## Future naming

When operations arrive, use `engagements` / `studio_projects` — do not overload public `projects`.

## Client usage

| Client | Key | RLS |
|--------|-----|-----|
| Public / browser | Publishable | Enforced |
| Admin server (after session) | `SUPABASE_SECRET_KEY` | Bypasses — session check is the gate |

Phase 1 ships **no CMS tables** until policies are ready.
