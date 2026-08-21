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
- `R2_PUBLIC_BASE_URL=https://media.architak.in` — CDN for `public/` only

### Contact (public-safe, still env)

- Phone, email, WhatsApp

### Discovery / security / flags

- Crawler allow/deny lists
- Rate-limit window/max
- `FEATURE_JOURNAL_NAV`, `FEATURE_THREE_D`

See `.env.example` for the canonical list.
