# ADR-003: R2 Single Private Bucket with public/private Prefixes

## Context

Need object storage for portfolio and future private documents. Bucket name: **`architak-media`**.

## Decision

One Cloudflare R2 bucket, **private ACL**. Object keys always start with `public/` or `private/`. Public delivery via `R2_PUBLIC_BASE_URL` (e.g. `media.architak.in`) gated to `public/` only (Worker). Private objects: short-lived signed URLs only.

## Alternatives

- Public bucket — **rejected** (leaks private keys)
- Two buckets — unnecessary complexity for V1
- Supabase Storage only — less CDN flexibility for public media

## Advantages

Single bucket, clear visibility model, ready for invoices/BOMs under `private/` later.

## Trade-offs

Custom domain must be on the same Cloudflare zone; Worker required so domain does not expose whole bucket.

## Consequences

`StorageService` takes visibility; adapter enforces prefix match. `media_assets.visibility` required.
