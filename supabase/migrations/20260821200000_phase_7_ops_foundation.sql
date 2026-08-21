-- Phase 7 operations foundation.
-- Distinct from public portfolio `projects`. Private media stays under private/.

begin;

create table public.clients (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(btrim(name)) between 1 and 200),
  check (email is null or char_length(email) <= 320),
  check (phone is null or char_length(phone) <= 32),
  check (notes is null or char_length(notes) <= 5000)
);

create table public.engagements (
  id uuid primary key default extensions.gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  code text not null unique,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'on_hold', 'closed')),
  started_on date,
  closed_on date,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (code ~ '^[A-Z0-9][A-Z0-9_-]{1,31}$'),
  check (char_length(title) between 1 and 200),
  check (summary is null or char_length(summary) <= 2000)
);

create table public.estimates (
  id uuid primary key default extensions.gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  label text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default extensions.gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'void')),
  amount_minor bigint check (amount_minor is null or amount_minor >= 0),
  currency text not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  issued_on date,
  due_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(btrim(name)) between 1 and 200)
);

create table public.bom_items (
  id uuid primary key default extensions.gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  vendor_id uuid references public.vendors (id) on delete set null,
  sku text,
  description text not null,
  quantity numeric(12, 3) not null default 1 check (quantity > 0),
  unit text not null default 'ea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory_items (
  id uuid primary key default extensions.gen_random_uuid(),
  sku text not null unique,
  name text not null,
  quantity_on_hand numeric(12, 3) not null default 0,
  unit text not null default 'ea',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.engagement_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  engagement_id uuid not null references public.engagements (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete restrict,
  label text,
  created_at timestamptz not null default now(),
  unique (engagement_id, media_asset_id)
);

create index clients_status_idx on public.clients (status, created_at desc);
create index engagements_client_idx on public.engagements (client_id, status);
create index estimates_engagement_idx on public.estimates (engagement_id);
create index invoices_engagement_idx on public.invoices (engagement_id);
create index bom_items_engagement_idx on public.bom_items (engagement_id);
create index engagement_documents_engagement_idx on public.engagement_documents (engagement_id);

create trigger clients_set_updated_at before update on public.clients
for each row execute function public.set_updated_at();
create trigger engagements_set_updated_at before update on public.engagements
for each row execute function public.set_updated_at();
create trigger estimates_set_updated_at before update on public.estimates
for each row execute function public.set_updated_at();
create trigger invoices_set_updated_at before update on public.invoices
for each row execute function public.set_updated_at();
create trigger vendors_set_updated_at before update on public.vendors
for each row execute function public.set_updated_at();
create trigger bom_items_set_updated_at before update on public.bom_items
for each row execute function public.set_updated_at();
create trigger inventory_items_set_updated_at before update on public.inventory_items
for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.engagements enable row level security;
alter table public.estimates enable row level security;
alter table public.invoices enable row level security;
alter table public.vendors enable row level security;
alter table public.bom_items enable row level security;
alter table public.inventory_items enable row level security;
alter table public.engagement_documents enable row level security;

-- Deny-by-default for anon/authenticated. Admin writes use the secret key after session checks.
create policy "clients deny public access"
on public.clients for all to anon, authenticated using (false) with check (false);
create policy "engagements deny public access"
on public.engagements for all to anon, authenticated using (false) with check (false);
create policy "estimates deny public access"
on public.estimates for all to anon, authenticated using (false) with check (false);
create policy "invoices deny public access"
on public.invoices for all to anon, authenticated using (false) with check (false);
create policy "vendors deny public access"
on public.vendors for all to anon, authenticated using (false) with check (false);
create policy "bom items deny public access"
on public.bom_items for all to anon, authenticated using (false) with check (false);
create policy "inventory items deny public access"
on public.inventory_items for all to anon, authenticated using (false) with check (false);
create policy "engagement documents deny public access"
on public.engagement_documents for all to anon, authenticated using (false) with check (false);

revoke all on table public.clients from anon, authenticated;
revoke all on table public.engagements from anon, authenticated;
revoke all on table public.estimates from anon, authenticated;
revoke all on table public.invoices from anon, authenticated;
revoke all on table public.vendors from anon, authenticated;
revoke all on table public.bom_items from anon, authenticated;
revoke all on table public.inventory_items from anon, authenticated;
revoke all on table public.engagement_documents from anon, authenticated;

commit;
