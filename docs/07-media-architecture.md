# Media Architecture

## Principle

The R2 bucket is **not** blindly public. Visibility is a first-class concept.

## Resources

- Supabase project: `architak-media`
- R2 bucket: `architak-media` — **private ACL**, one bucket

## Key layout

```text
architak-media/
├── public/
│   ├── projects/
│   ├── portfolio/
│   └── documents/
└── private/
    ├── clients/
    ├── invoices/
    ├── bom/
    ├── drawings/
    └── vendors/
```

| Class | Examples | Delivery |
|-------|----------|----------|
| Public | Project photos, portfolio, public PDFs | CDN e.g. `https://media.architak.in/public/...` |
| Private | Client docs, invoices, BOMs, drawings, vendors | Short-lived signed GET only |

## Database

`media_assets` stores:

- `storage_provider`, `storage_key` (includes `public/` or `private/`)
- `visibility` (`public` \| `private`)
- mime, size, dimensions, alt, caption, metadata

Adapter **refuses** mismatched visibility and prefix.

## Custom domain

`media.architak.in` requires the hostname in the **same Cloudflare account/zone** as the R2 bucket. A Worker (or equivalent) must serve **`public/` only** — never attach a custom domain that exposes the whole bucket.

## Env

```text
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=architak-media
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=https://media.architak.in
```

`R2_ENDPOINT` = S3 API. `R2_PUBLIC_BASE_URL` = CDN for public keys only (optional until DNS ready).

## Upload pipeline (Phase 5)

Auth → permission → validate → signed upload → metadata → variants → CDN (public only).
