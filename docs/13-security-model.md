# Security Model

## Principles

- Authorization on the server (and RLS) — UI checks are insufficient
- Fail-closed env configuration
- Never disable Supabase RLS
- Never make the R2 bucket blindly public
- Never commit secrets

## Baseline

- Zod `lib/env.ts` + `pnpm env:check`
- `.gitignore` for `.env*` except `.env.example`
- Static admin session cookie; auth gate in `app/admin/(dashboard)/layout.tsx`
- Security headers in `next.config.ts` (CSP starter, HSTS, nosniff, referrer-policy, permissions-policy, frame denial)
- `robots.ts` denies `/admin`, `/api/`, `/dev/`
- Rate limits on login and enquiry; honeypot + timing check on contact
- Dependabot; CI lint/typecheck/build + adaptive/a11y Playwright job

## RLS summary

| Surface | Policy |
|---------|--------|
| Published portfolio / pages / public media metadata | anon SELECT |
| Enquiries | anon INSERT (safe columns, status=new) only |
| Ops tables, profiles, settings, audit, redirects, enquiry_events | deny all to anon/authenticated |
| Admin writes | `SUPABASE_SECRET_KEY` **only after** `requireAdminSession()` |

Audit checklist: `docs/20-hardening-and-cutover.md`.

## Media

Private keys never served via `media.architak.in`. Worker source: `cloudflare/media-worker/`. Presigned URLs only for private objects.

## Later

- Nonce-based CSP once motion bundles are verified under it
- MFA when Supabase Auth replaces static admin credentials
- Preview deployment protection
