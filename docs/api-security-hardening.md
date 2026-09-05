# API security hardening notes

## Controls in place

| Surface | Controls |
|---------|----------|
| Contact enquiry | Zod validation, honeypot, min open time, **5/min/IP**, anon column-limited insert + RLS |
| Admin login | Credential verify, **≤10/min/IP**, HttpOnly session cookie |
| Admin APIs | Session required, probe/unauth/authed rate limits, security headers |
| Media upload/delete | Session + mutate rate limits, filename sanitization, media validation/quota |
| Telegram test | Session + **3/min/IP** |
| Discover API | Feature flag, rate limit, published-only static data |
| Health | **60/min/IP**, no secrets |
| Cron keep-alive | Bearer `CRON_SECRET` (≥32), fail-closed, failed-auth rate limit, publishable DB read only |

## Operator checklist

1. Set a random `CRON_SECRET` (≥32 chars) in **Vercel Production** and GitHub Actions secrets.
2. Prefer Production-only for `CRON_SECRET` (not Preview).
3. Keep `TELEGRAM_*` and `SUPABASE_SECRET_KEY` server-only — never `NEXT_PUBLIC_*`.
4. Rotate `CRON_SECRET` / admin password if either may have leaked.
5. Monitor Vercel logs for `enquiry insert failed`, `admin-api-unauth`, `supabase_keepalive_failed`.
