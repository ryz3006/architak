# ARCHITAK media Worker

This Worker is the only public route to the private `architak-media` R2 bucket. It serves `GET` and `HEAD` requests for `public/*` keys and returns `404` for private, unprefixed, malformed, or traversal paths.

## Cloudflare configuration

1. Create the private R2 bucket named `architak-media`.
2. From this directory, authenticate Wrangler with a Cloudflare account that owns both the bucket and the `architak.in` zone.
3. Review `wrangler.toml`, then run `pnpm media:worker:deploy` from the repo root (requires `CLOUDFLARE_API_TOKEN`).
4. Until `architak.in` is on this Cloudflare account, the Worker serves at `https://architak-media.architak.workers.dev`. After the zone is active, uncomment the `media.architak.in` custom domain route and redeploy.
5. In Cloudflare Workers & Pages, confirm the `MEDIA_BUCKET` R2 binding targets `architak-media`.
6. Confirm `media.architak.in` is attached to this Worker as a Custom Domain once DNS is on Cloudflare. Do not attach an R2 public-development URL or an R2 custom domain directly to the bucket.

Deployment and DNS changes require explicit Cloudflare control-plane authorization. The repository's R2 S3 credentials are object-storage credentials and must not be used for Worker deployment.

## CORS

The Worker allowlist is the comma-separated `ALLOWED_ORIGINS` value in `wrangler.toml`:

```text
http://localhost:3000,https://architak.vercel.app,https://architak.in,https://www.architak.in
```

The checked-in configuration contains localhost and the two production site domains. Add `https://architak.vercel.app` if that is the production Vercel hostname, or replace it with the exact assigned hostname before deployment. Add each Vercel preview URL explicitly while testing; do not use `*` or a wildcard suffix for production.

If browser clients also access R2 through presigned S3 URLs, set this exact bucket CORS policy in R2 Settings (replace the Vercel hostname if the assigned hostname differs):

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://architak.vercel.app",
      "https://architak.in",
      "https://www.architak.in"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Range"],
    "ExposeHeaders": [
      "Content-Length",
      "Content-Range",
      "Content-Type",
      "ETag",
      "Last-Modified"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

R2 bucket CORS does not apply to responses produced through an R2 Worker binding, so keep the Worker's `ALLOWED_ORIGINS` synchronized with the bucket policy.

## Local verification

Run `pnpm dlx wrangler dev` in this directory. Check that a real `/public/...` object supports `GET` and `HEAD`, while `/private/...`, unprefixed paths, encoded slashes, and traversal attempts return `404`; methods other than `GET` and `HEAD` return `405`.
