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

The Worker implementation is in `cloudflare/media-worker/`. Its `MEDIA_BUCKET` binding targets the private `architak-media` bucket. It permits only `GET` and `HEAD`, validates the raw URL path before decoding it, and rejects private, unprefixed, malformed, encoded-separator, and traversal paths. Public responses receive CDN cache headers and origin-reflecting CORS only for explicitly configured origins.

Deploying the Worker or attaching `media.architak.in` is a Cloudflare control-plane operation and is intentionally separate from the R2 S3 bootstrap credentials. With `CLOUDFLARE_API_TOKEN` in `.env.local`, run `pnpm media:worker:deploy`. The Worker is reachable at `https://architak-media.architak.workers.dev` until the `architak.in` zone is added to this Cloudflare account; then uncomment the `media.architak.in` custom domain route in `cloudflare/media-worker/wrangler.toml` and redeploy. Do not enable the bucket's public-development URL.

## Prefix bootstrap

R2 has a flat object namespace, so the expected directories are represented by zero-byte `.keep` objects. The bootstrap is idempotent and reads credentials from the process environment or `.env.local` without printing their values:

```bash
pnpm r2:bootstrap # create missing markers, then verify all markers
pnpm r2:verify    # read-only verification
```

The required variables are `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_ENDPOINT`.

## CORS

Worker responses allow only origins listed exactly in `ALLOWED_ORIGINS`; production must never use `*`. Keep localhost, the exact Vercel production/preview hostnames being tested, and the production site hostnames synchronized with the R2 bucket CORS policy. Prefer `pnpm r2:cors` when the R2 API token includes `PutBucketCors`; otherwise paste the policy from `cloudflare/media-worker/README.md` in the Cloudflare R2 console.

## Env

```text
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=architak-media
R2_ENDPOINT=
R2_PUBLIC_BASE_URL=https://architak-media.architak.workers.dev
```

`R2_ENDPOINT` = S3 API. `R2_PUBLIC_BASE_URL` = CDN for public keys only. Use the Worker `workers.dev` URL while testing; switch to `https://media.architak.in` after the custom domain is attached.

## Upload pipeline (Phase 5)

Auth → permission → validate → signed upload → metadata → variants → CDN (public only).
