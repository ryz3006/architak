# Environment and Configuration

## Rules

- Secrets: GitHub Environment secrets + Vercel encrypted env
- Local: `.env.local` (gitignored); copy from `.env.example`
- Boot: Zod parse in `lib/env.ts`; fail closed in production
- `NEXT_PUBLIC_*` only for browser-safe values
- Content in DB; credentials and feature flags in env

## Mapping

| Environment | Source |
|-------------|--------|
| local | `.env.local` |
| preview | GitHub `preview` → Vercel Preview |
| production | GitHub `production` → Vercel Production |

## Variable groups

### App

- `NODE_ENV`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_BASE_PATH` (default `/admin`)

### Admin auth (server-only)

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

### Supabase (`architak-media`, RLS on by default)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY` — never public

### Cloudflare R2 (bucket `architak-media`, private)

- `CLOUDFLARE_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME=architak-media`
- `R2_ENDPOINT`
- `R2_PUBLIC_BASE_URL` — CDN for `public/` only. Testing: `https://architak-media.architak.workers.dev`. Production: `https://media.architak.in` after DNS is on Cloudflare.

### Operator bootstrap (local `.env.local` only — not required by Next.js)

- `SUPABASE_DB_PASSWORD` or `DATABASE_URL` — for `pnpm db:apply`
- `CLOUDFLARE_API_TOKEN` — for `pnpm media:worker:deploy` (Workers Edit + R2 + Zone DNS)

### Contact (public-safe, still env)

- Phone, email, WhatsApp

### Discovery / security / flags

- Crawler allow/deny lists
- Rate-limit window/max
- `FEATURE_JOURNAL_NAV`, `FEATURE_THREE_D`

See `.env.example` for the canonical list.

## Verification

Run `pnpm env:check` before local development and deployment. The command
checks `.env.local` plus the current process environment, prints variable names
and coarse shape checks only, and never prints values.

Run `pnpm env:check --vercel` for the names that must be mirrored into both
Vercel Preview and Production. Changes to `NEXT_PUBLIC_*` values require a new
deployment because Next.js embeds them during the build.

The release gate is:

1. `pnpm env:check` reports zero blocking issues.
2. Vercel Production and Preview contain every required name.
3. `NEXT_PUBLIC_SITE_URL` is the canonical URL for that environment.
4. `/api/health`, `/`, `/admin/login`, login, and logout pass after deployment.
