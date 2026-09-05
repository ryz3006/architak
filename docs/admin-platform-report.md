# ARCHITAK Admin Platform — Final Report

## Status

Production-ready admin console at `/admin` covering Gallery, Projects, Enquiries (Leads), Website Management, SEO (with scoring + 20-version history), Dashboard, System Health, Settings (Telegram), plus public CMS wiring with static fallbacks.

## Architecture

- **Public site** resolves content CMS-first → bundled `content/static/site.json` fallback
- **Admin** uses Server Actions / Route Handlers with `requireAdminSession()` before secret Supabase
- **Media** validates via `MediaCapabilities` (7 GB hard / 6 GB warning), R2 presigned upload, DB `byte_size` accounting
- **Telegram** is a post-commit notification channel (`after()`), never blocks enquiry success
- **SEO** stores in `seo_metadata` + `seo_versions`; public pages use `getPageSeoFromCms` with `PAGE_SEO` fallback

## Schema (additive migration)

`supabase/migrations/20260905120000_admin_platform_extensions.sql`

- Enquiry statuses: `in_discussion`, `converted`
- Enquiry events: `notification_queued|sent|failed`
- `seo_versions` (max 20 enforced in app)
- Seed `pages` + `seo_metadata` for home/studio/services/contact
- `project_testimonials` + public read RLS for enabled quotes on published projects

Apply with: `pnpm db:apply`

## Key routes

| Area | Path |
|------|------|
| Dashboard | `/admin` |
| Gallery | `/admin/media` |
| Projects | `/admin/projects`, `/new`, `/[slug]` |
| Leads | `/admin/enquiries`, `/admin/enquiries/[id]` |
| Website | `/admin/website-management` |
| SEO | `/admin/seo` |
| Health | `/admin/system-health` |
| Settings | `/admin/settings` |
| APIs | `/api/admin/media`, `/api/admin/enquiries/export`, `/api/admin/notifications/telegram/{test,status}` |

## Public wiring

- `/work/[slug]` → `resolvePublishedProject` + `generateStaticParams`
- Home Selected Work → Website Management `selectedWorkSlugs` (fallback: featured CMS / static)
- Homepage videos → `homepageVideoIds` order
- Studio dome → `studioDomeSlugs` + `fillToMinimum(8)`
- Page metadata → async `generateMetadata` + `getPageSeoFromCms`
- ISR: `revalidate = 60` on home, studio, work detail; path revalidation on publish

## Env vars (server-only Telegram)

- `TELEGRAM_NOTIFICATIONS_ENABLED` (default off)
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_NOTIFICATION_TIMEOUT_MS` (default 5000)

## Security highlights

- Admin APIs independently verify session
- Telegram token never sent to browser (masked in Settings)
- Media dual validation; referenced assets not blindly deleted
- `/admin` remains noindex via admin layout
- Enquiry rate limit / honeypot retained

## Tests

```bash
pnpm typecheck
node scripts/verify-admin-platform.mjs
```

Unit script covers fill-to-minimum, SEO length scoring, media format rejects, storage quota, truncation.

## Limitations / incomplete

- ⚠ Discovery surfaces (`sitemap`, `/api/v1/discover`, llms.txt) still primarily use static project index — CMS titles for those surfaces are not fully unified
- ⚠ Project-level SEO editing UI not exposed (page subjects only); project pages use title/summary metadata
- ⚠ Website placement config is read with the secret Supabase client on the server (`site_settings` is not anon-readable) — values are non-secret slugs only
- ⚠ E2E Playwright coverage for admin flows not added (existing a11y/hero e2e only)
- ⚠ Migration must be applied on the remote database before CMS/Telegram/SEO version features work against live Supabase

### Supabase inactivity pause

- Endpoint: `GET /api/cron/supabase-keepalive` (Bearer `CRON_SECRET`)
- Vercel Cron: daily `0 3 * * *` (Hobby plan max frequency)
- GitHub Actions: hourly `.github/workflows/supabase-keepalive.yml` (set secrets `KEEPALIVE_SITE_URL` + `CRON_SECRET`)

## Cutover checklist

1. **Restore reachable Supabase** — current project host in `.env.local` returns NXDOMAIN; update URL/keys then `pnpm db:apply`
2. Set Telegram env vars in Vercel; enable only after test message succeeds
3. Set production `NEXT_PUBLIC_SITE_URL` and (when ready) `R2_PUBLIC_BASE_URL=https://media.architak.in`
4. Upload gallery media; assign covers/galleries on projects; publish
5. Configure Website Management order; publish
6. Review SEO console scores; save once to seed version history
7. Smoke-test contact form → enquiry row → Telegram (if enabled)

See also: [`go-live-checklist.md`](./go-live-checklist.md).
