# ARCHITAK Platform — Ops notes

## Secret scanning

Enable GitHub **secret scanning** and **push protection** on the repository. Never commit `.env.local`.

## Environments

Map GitHub Environments `preview` / `production` to Vercel Preview / Production env vars. See `docs/16-environment-and-configuration.md`.

## Vercel deployment checklist

1. Framework preset is Next.js. `vercel.json` is the repository-level source
   of truth.
2. Run `pnpm env:check --vercel` and mirror all required names into Preview and
   Production. Values stay in Vercel; never copy them into this document.
3. Deploy without reusing a stale build cache after changing framework or
   `NEXT_PUBLIC_*` configuration.
4. Confirm the build log detects Next.js and lists `/` as a generated route.
5. Smoke-test `/`, `/work`, `/api/health`, `/admin/login`, login, and logout.
6. Confirm `/admin` is not indexed and redirects unauthenticated visitors.

## Local release gate

```text
pnpm env:check
pnpm lint
pnpm typecheck
pnpm build
```

`pnpm build` can fail on Windows when the paging file is too small to load the
Next.js SWC binary. That is a local machine resource issue, not a Vercel build
failure; increase the Windows paging file and rerun before release.
