-- First-party website traffic (page views) with privacy-light columns.
-- Admin-only reads via service role; anon cannot SELECT. Inserts go through
-- the Next.js collect API using the secret client after validation.

begin;

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  path text not null,
  country text,
  region text,
  city text,
  browser text,
  device text,
  referrer_host text,
  visitor_id text,
  check (char_length(path) between 1 and 500),
  check (country is null or char_length(country) <= 8),
  check (region is null or char_length(region) <= 80),
  check (city is null or char_length(city) <= 80),
  check (browser is null or char_length(browser) <= 40),
  check (device is null or char_length(device) <= 20),
  check (referrer_host is null or char_length(referrer_host) <= 200),
  check (visitor_id is null or char_length(visitor_id) <= 64)
);

create index if not exists page_views_occurred_at_idx
  on public.page_views (occurred_at desc);

create index if not exists page_views_path_idx
  on public.page_views (path);

create index if not exists page_views_country_idx
  on public.page_views (country)
  where country is not null;

create index if not exists page_views_browser_idx
  on public.page_views (browser)
  where browser is not null;

alter table public.page_views enable row level security;

-- No public policies: table is opaque to anon/authenticated.
-- Service-role (secret key) bypasses RLS for insert + admin analytics.

revoke all on table public.page_views from anon, authenticated;

-- Exact relation size for retention enforcement (table + indexes).
create or replace function public.page_views_relation_bytes()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(pg_total_relation_size('public.page_views'), 0)::bigint;
$$;

revoke all on function public.page_views_relation_bytes() from public, anon, authenticated;
grant execute on function public.page_views_relation_bytes() to service_role;

commit;
