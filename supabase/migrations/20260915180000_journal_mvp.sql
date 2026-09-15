-- ARCHITAK Journal MVP: posts, related work, share analytics, expiry lifecycle.

begin;

-- Journal posts with multi-script support and expiry
create table public.journal_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body jsonb not null default '{}'::jsonb check (jsonb_typeof(body) = 'object'),
  cover_media_id uuid references public.media_assets (id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived', 'trashed')),
  published_at timestamptz,
  expires_at timestamptz,
  expiry_action text not null default 'hard_delete' check (expiry_action in ('hard_delete', 'archive')),
  trashed_at timestamptz,
  lang text check (lang is null or lang in ('en', 'hi', 'ar', 'ml', 'ta', 'kn')),
  dir text check (dir is null or dir in ('auto', 'ltr', 'rtl')),
  reading_time integer check (reading_time is null or reading_time > 0),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(title) between 1 and 200),
  check (excerpt is null or char_length(excerpt) <= 1000),
  check (status <> 'published' or published_at is not null),
  check (expires_at is null or expires_at > published_at),
  check (status <> 'trashed' or trashed_at is not null)
);

-- Journal posts related to work/projects
create table public.journal_post_related_projects (
  journal_post_id uuid not null references public.journal_posts (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (journal_post_id, project_id),
  unique (journal_post_id, sort_order)
);

-- First-party engagement events: share taps, downloads, etc.
-- 90-day retention enforced by cron.
create table public.engagement_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  event_type text not null check (event_type in ('share', 'download', 'click')),
  subject_type text not null check (subject_type in ('journal_post', 'project', 'page')),
  subject_slug text not null,
  method text check (method is null or char_length(method) <= 40),
  country text,
  region text,
  city text,
  browser text,
  device text,
  referrer_host text,
  visitor_id text,
  check (char_length(subject_slug) between 1 and 200),
  check (country is null or char_length(country) <= 8),
  check (region is null or char_length(region) <= 80),
  check (city is null or char_length(city) <= 80),
  check (browser is null or char_length(browser) <= 40),
  check (device is null or char_length(device) <= 20),
  check (referrer_host is null or char_length(referrer_host) <= 200),
  check (visitor_id is null or char_length(visitor_id) <= 64)
);

-- Extend seo_metadata to support journal_post
alter table public.seo_metadata drop constraint if exists seo_metadata_subject_type_check;
alter table public.seo_metadata add constraint seo_metadata_subject_type_check
  check (subject_type in ('global', 'page', 'project', 'journal_post'));

-- Indexes
create index journal_posts_public_idx on public.journal_posts (featured desc, published_at desc)
  where status = 'published' and (expires_at is null or expires_at > now()) and trashed_at is null;
create index journal_posts_cover_media_idx on public.journal_posts (cover_media_id)
  where cover_media_id is not null;
create index journal_posts_status_idx on public.journal_posts (status, updated_at desc);
create index journal_posts_trashed_idx on public.journal_posts (trashed_at desc)
  where trashed_at is not null;
create index journal_posts_expires_idx on public.journal_posts (expires_at)
  where expires_at is not null and status = 'published';

create index journal_post_related_projects_project_idx
  on public.journal_post_related_projects (project_id);

create index engagement_events_occurred_at_idx on public.engagement_events (occurred_at desc);
create index engagement_events_subject_idx on public.engagement_events (subject_type, subject_slug, occurred_at desc);
create index engagement_events_type_idx on public.engagement_events (event_type, occurred_at desc);

-- Triggers
create trigger journal_posts_set_updated_at before update on public.journal_posts
for each row execute function public.set_updated_at();

-- RLS
alter table public.journal_posts enable row level security;
alter table public.journal_post_related_projects enable row level security;
alter table public.engagement_events enable row level security;

-- Public can read published non-expired non-trashed posts
create policy "public can read published journal posts"
on public.journal_posts for select to anon, authenticated
using (
  status = 'published'
  and published_at <= now()
  and (expires_at is null or expires_at > now())
  and trashed_at is null
);

-- Public can read related projects for published posts
create policy "public can read journal post related projects"
on public.journal_post_related_projects for select to anon, authenticated
using (
  exists (
    select 1 from public.journal_posts post
    where post.id = journal_post_related_projects.journal_post_id
      and post.status = 'published'
      and post.published_at <= now()
      and (post.expires_at is null or post.expires_at > now())
      and post.trashed_at is null
  )
  and exists (
    select 1 from public.projects project
    where project.id = journal_post_related_projects.project_id
      and project.status = 'published'
      and project.published_at <= now()
  )
);

-- Engagement events deny public access (admin-only via service role)
create policy "engagement events deny public access"
on public.engagement_events for all to anon, authenticated
using (false) with check (false);

-- Public can read SEO for published journal posts
create policy "public can read seo for published journal posts"
on public.seo_metadata for select to anon, authenticated
using (
  subject_type = 'journal_post'
  and exists (
    select 1 from public.journal_posts post
    where post.id = seo_metadata.subject_id
      and post.status = 'published'
      and post.published_at <= now()
      and (post.expires_at is null or post.expires_at > now())
      and post.trashed_at is null
  )
);

-- Grant SELECT
revoke all on table public.journal_posts from anon, authenticated;
revoke all on table public.journal_post_related_projects from anon, authenticated;
revoke all on table public.engagement_events from anon, authenticated;

grant select on table public.journal_posts to anon, authenticated;
grant select on table public.journal_post_related_projects to anon, authenticated;

-- Function to estimate engagement_events relation size
create or replace function public.engagement_events_relation_bytes()
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(pg_total_relation_size('public.engagement_events'), 0)::bigint;
$$;

revoke all on function public.engagement_events_relation_bytes() from public, anon, authenticated;
grant execute on function public.engagement_events_relation_bytes() to service_role;

commit;
