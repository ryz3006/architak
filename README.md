# ARCHITAK Platform

Premium digital platform for ARCHITAK (Kochi interiors studio).

## Stack

- Next.js App Router + TypeScript
- Supabase Postgres (`architak-media`, RLS on by default)
- Cloudflare R2 (`architak-media`, private bucket, `public/` / `private/` keys)
- Vercel deployment

## Getting started

```bash
pnpm install
cp .env.example .env.local
# Fill required values in .env.local
pnpm dev
```

Public pages use **local mirrored images** under `public/media/architak-in/` and copy from `content/static/site.json`, so the marketing site works offline without Supabase or R2.

```bash
pnpm media:scrape    # re-download from architak.in
pnpm media:manifest  # rebuild content/static/images.json
```

See [docs/16-environment-and-configuration.md](docs/16-environment-and-configuration.md) and [content/static/README.md](content/static/README.md).

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Local development |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |

## Admin

Static env login at `/admin` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`). Never commit secrets.
