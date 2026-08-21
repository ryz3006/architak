# Operations domain

Portfolio `projects` are public marketing content.

Operational work uses **`engagements`** (linked to `clients`). Never overload
the public `projects` table for jobs, invoices, or BOMs.

## Storage

All ops files live under R2 `private/`:

- `private/clients/`
- `private/invoices/`
- `private/bom/`
- `private/drawings/`
- `private/vendors/`

Delivery is short-lived signed GET only. Never through `media.architak.in`.

## Tables (Phase 7 foundation)

`clients`, `engagements`, `estimates`, `invoices`, `vendors`, `bom_items`,
`inventory_items`, `engagement_documents` — RLS enabled, deny-by-default for
anon/authenticated. Admin access uses `SUPABASE_SECRET_KEY` after session auth.

## Deferred

Payment gateways, GST e-invoicing depth, procurement workflows, inventory stock
movements.
