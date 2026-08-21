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
| `pnpm env:check` | Validate local configuration without printing values |
| `pnpm r2:bootstrap` | Create and verify the R2 prefix marker objects |
| `pnpm r2:verify` | Verify R2 prefix markers without writing |
| `pnpm media:scrape` | Refresh the local architak.in media mirror |
| `pnpm media:manifest` | Rebuild the local image manifest |

The private R2 bucket and public-only delivery Worker are documented in [docs/07-media-architecture.md](docs/07-media-architecture.md) and [cloudflare/media-worker/README.md](cloudflare/media-worker/README.md). Worker deployment and DNS changes are separate Cloudflare control-plane operations.

## Admin

Static env login at `/admin` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`). Never commit secrets.
