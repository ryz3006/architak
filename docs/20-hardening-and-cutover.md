# Hardening and cutover runbook

## RLS audit checklist

For every table in `supabase/migrations/`:

1. `ENABLE ROW LEVEL SECURITY` present in the same migration as `CREATE TABLE`
2. Explicit policies documented (or deny-all for ops tables)
3. Anon grants are least privilege (SELECT published / INSERT enquiries only)
4. No `DISABLE ROW LEVEL SECURITY`
5. Secret-key usage only after `requireAdminSession()`

Record findings in `docs/13-security-model.md` when the remote migration is applied.

## Media Worker

Source: `cloudflare/media-worker/`

- Serves `public/` only
- Rejects traversal, private keys, and non GET/HEAD
- Bind bucket `architak-media`, custom domain `media.architak.in`
- Deploy with Wrangler once Cloudflare auth is available on a CI or operator machine

## DNS cutover (`architak.in` → Vercel)

1. Confirm Production env vars mirror `pnpm env:check --vercel`
2. Confirm `/`, `/work`, `/sitemap.xml`, `/llms.txt`, `/admin/login`
3. Apply WordPress redirects in `next.config.ts` from the live URL inventory
4. Point apex/www DNS to Vercel
5. Submit sitemap in Search Console
6. Keep WordPress read-only until crawl errors clear

## Secret scanning

Enable GitHub secret scanning and push protection on `ryz3006/architak`.
