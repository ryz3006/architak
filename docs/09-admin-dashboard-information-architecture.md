# Admin Dashboard Information Architecture

## Initial modules (Phase 5)

```text
Dashboard
Website
├── Projects
├── Categories
├── Media Library          # explicit public vs private
├── Testimonials
├── Videos
├── Pages
└── Navigation
Leads
├── Enquiries
└── Interaction History
SEO
├── Page Metadata
├── Redirects
└── AI summaries (llms.txt feed)
Security
├── Users and roles        # after Supabase Auth
├── Audit log
└── Env policy (redacted)
Settings
```

## Phase 1

Minimal shell: login + gated `/admin` placeholder. No full CMS yet.

## Auth

Phase 1–4: static env username/password.  
Phase 5+: Supabase Auth + roles.

## Media uploads

Always choose visibility. Keys must start with `public/` or `private/`. Never expose private objects via `media.architak.in`.
