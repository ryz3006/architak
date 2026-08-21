# Security Model

## Principles

- Authorization on the server (and RLS) — UI checks are insufficient
- Fail-closed env configuration
- Never disable Supabase RLS
- Never make the R2 bucket blindly public
- Never commit secrets

## Phase 1 baseline

- Zod `lib/env.ts`
- `.gitignore` for `.env*` except `.env.example`
- Static admin session cookie; middleware on `/admin`
- Security headers: CSP starter, HSTS (production), nosniff, referrer-policy, permissions-policy, frame denial for admin
- `robots.ts` denies `/admin`

## Clients and RLS

| Path | Key | Behavior |
|------|-----|----------|
| Public | Publishable | RLS enforced |
| Admin writes | Secret key | Bypasses RLS; **only after** session verification |

## Later phases

- CSRF / origin checks on Server Actions
- Rate limits on enquiry and login
- Honeypot on contact
- Signed uploads; MIME/size validation
- Audit log
- Dependabot; preview deployment protection
- MFA when Supabase Auth lands

## Media

Private keys never served via `media.architak.in`. Presigned URLs only for private objects.
