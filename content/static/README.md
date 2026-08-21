# Static offline content

Mirrored media from the legacy WordPress site (`architak.in`) so the public experience works **without** Cloudflare R2 or Supabase.

## Layout

| Path | Purpose |
|------|---------|
| `public/media/architak-in/` | Downloaded images (served statically) |
| `content/static/site.json` | Studio copy, services, featured projects |
| `content/static/images.json` | Full local image inventory |
| `content/media/` | Scrape artifacts (HTML snapshots, API dumps) |

## Refresh media

```bash
pnpm media:scrape
pnpm media:manifest
```

The public site reads only local files. CMS/R2 can replace this later without changing public routes.
