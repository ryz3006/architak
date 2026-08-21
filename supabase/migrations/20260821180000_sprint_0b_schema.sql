begin;

create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = statement_timestamp();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (display_name is null or char_length(display_name) between 1 and 120)
);

create table public.media_assets (
  id uuid primary key default extensions.gen_random_uuid(),
  storage_provider text not null default 'r2' check (storage_provider in ('r2')),
  storage_key text not null unique,
  visibility text not null check (visibility in ('public', 'private')),
  mime_type text not null,
  byte_size bigint not null check (byte_size >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  alt_text text,
  caption text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (visibility = 'public' and storage_key ~ '^public/.+')
    or (visibility = 'private' and storage_key ~ '^private/.+')
  ),
  check (mime_type ~ '^[a-z0-9][a-z0-9.+-]*/[a-z0-9][a-z0-9.+-]*$'),
  check (alt_text is null or char_length(alt_text) <= 300),
  check (caption is null or char_length(caption) <= 1000)
);

create table public.project_categories (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  sort_order integer not null default 0 check (sort_order >= 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(name) between 1 and 120),
  check (status <> 'published' or published_at is not null)
);

create table public.projects (
  id uuid primary key default extensions.gen_random_uuid(),
  category_id uuid references public.project_categories (id) on delete set null,
  cover_media_id uuid references public.media_assets (id) on delete set null,
  slug text not null unique,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb check (jsonb_typeof(body) = 'object'),
  location text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  completed_on date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(title) between 1 and 200),
  check (summary is null or char_length(summary) <= 1000),
  check (status <> 'published' or published_at is not null)
);

create table public.project_media (
  project_id uuid not null references public.projects (id) on delete cascade,
  media_asset_id uuid not null references public.media_assets (id) on delete restrict,
  role text not null default 'gallery' check (role in ('cover', 'gallery', 'plan', 'document')),
  sort_order integer not null default 0 check (sort_order >= 0),
  caption text,
  created_at timestamptz not null default now(),
  primary key (project_id, media_asset_id),
  unique (project_id, sort_order),
  check (caption is null or char_length(caption) <= 1000)
);

create table public.project_related (
  project_id uuid not null references public.projects (id) on delete cascade,
  related_project_id uuid not null references public.projects (id) on delete cascade,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  primary key (project_id, related_project_id),
  unique (project_id, sort_order),
  check (project_id <> related_project_id)
);

create table public.pages (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(title) between 1 and 200),
  check (status <> 'published' or published_at is not null)
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (key ~ '^[a-z][a-z0-9_.-]*$'),
  check (char_length(key) <= 120)
);

create table public.enquiries (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  message text not null,
  source_page text,
  consent boolean not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  assigned_to uuid references auth.users (id) on delete set null,
  client_ip inet,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(btrim(name)) between 1 and 120),
  check (email is null or (char_length(email) <= 320 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  check (phone is null or char_length(phone) between 7 and 32),
  check (email is not null or phone is not null),
  check (char_length(btrim(message)) between 1 and 5000),
  check (source_page is null or (char_length(source_page) <= 500 and source_page ~ '^/')),
  check (consent = true),
  check (user_agent is null or char_length(user_agent) <= 1000)
);

create table public.enquiry_events (
  id uuid primary key default extensions.gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries (id) on delete cascade,
  event_type text not null check (event_type in ('created', 'status_changed', 'assigned', 'note_added')),
  from_status text check (from_status is null or from_status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  to_status text check (to_status is null or to_status in ('new', 'contacted', 'qualified', 'closed', 'spam')),
  note text,
  actor_id uuid references auth.users (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (note is null or char_length(note) <= 5000),
  check (
    event_type <> 'status_changed'
    or (from_status is not null and to_status is not null and from_status <> to_status)
  )
);

create table public.redirects (
  id uuid primary key default extensions.gen_random_uuid(),
  source_path text not null unique,
  destination text not null,
  status_code smallint not null default 301 check (status_code in (301, 302, 307, 308)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_path ~ '^/[^\s]*$'),
  check (destination ~ '^(\/|https:\/\/)[^\s]+$'),
  check (source_path <> destination),
  check (char_length(source_path) <= 2000 and char_length(destination) <= 2000)
);

create table public.seo_metadata (
  id uuid primary key default extensions.gen_random_uuid(),
  subject_type text not null check (subject_type in ('global', 'page', 'project')),
  subject_id uuid,
  title text,
  description text,
  canonical_url text,
  robots text,
  open_graph jsonb not null default '{}'::jsonb check (jsonb_typeof(open_graph) = 'object'),
  structured_data jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_data) = 'object'),
  ai_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (subject_type = 'global' and subject_id is null)
    or (subject_type in ('page', 'project') and subject_id is not null)
  ),
  check (title is null or char_length(title) <= 200),
  check (description is null or char_length(description) <= 500),
  check (canonical_url is null or canonical_url ~ '^https://'),
  check (robots is null or char_length(robots) <= 200),
  check (ai_summary is null or char_length(ai_summary) <= 2000)
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id uuid,
  ip_address inet,
  created_at timestamptz not null default now(),
  check (action ~ '^[a-z][a-z0-9_.-]*$'),
  check (entity_type ~ '^[a-z][a-z0-9_.-]*$'),
  check (before_data is null or jsonb_typeof(before_data) = 'object'),
  check (after_data is null or jsonb_typeof(after_data) = 'object')
);

create index media_assets_visibility_idx on public.media_assets (visibility);
create index media_assets_created_by_idx on public.media_assets (created_by) where created_by is not null;
create index project_categories_public_idx on public.project_categories (sort_order, published_at) where status = 'published';
create index projects_category_idx on public.projects (category_id);
create index projects_public_idx on public.projects (is_featured desc, sort_order, published_at desc) where status = 'published';
create index projects_cover_media_idx on public.projects (cover_media_id) where cover_media_id is not null;
create index project_media_asset_idx on public.project_media (media_asset_id);
create index project_related_related_idx on public.project_related (related_project_id);
create index pages_public_idx on public.pages (published_at desc) where status = 'published';
create index enquiries_status_created_idx on public.enquiries (status, created_at desc);
create index enquiries_assigned_to_idx on public.enquiries (assigned_to) where assigned_to is not null;
create index enquiry_events_enquiry_created_idx on public.enquiry_events (enquiry_id, created_at);
create index redirects_active_idx on public.redirects (source_path) where is_active;
create unique index seo_metadata_subject_idx on public.seo_metadata (subject_type, subject_id) where subject_id is not null;
create unique index seo_metadata_global_idx on public.seo_metadata (subject_type) where subject_type = 'global';
create index audit_events_entity_idx on public.audit_events (entity_type, entity_id, created_at desc);
create index audit_events_actor_idx on public.audit_events (actor_id, created_at desc) where actor_id is not null;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
for each row execute function public.set_updated_at();
create trigger project_categories_set_updated_at before update on public.project_categories
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger pages_set_updated_at before update on public.pages
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
create trigger enquiries_set_updated_at before update on public.enquiries
for each row execute function public.set_updated_at();
create trigger redirects_set_updated_at before update on public.redirects
for each row execute function public.set_updated_at();
create trigger seo_metadata_set_updated_at before update on public.seo_metadata
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.media_assets enable row level security;
alter table public.project_categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.project_related enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_events enable row level security;
alter table public.redirects enable row level security;
alter table public.seo_metadata enable row level security;
alter table public.audit_events enable row level security;

create policy "public can read public media metadata"
on public.media_assets for select to anon, authenticated
using (visibility = 'public');

create policy "public can read published categories"
on public.project_categories for select to anon, authenticated
using (status = 'published' and published_at <= now());

create policy "public can read published projects"
on public.projects for select to anon, authenticated
using (
  status = 'published'
  and published_at <= now()
  and (
    category_id is null
    or exists (
      select 1
      from public.project_categories category
      where category.id = projects.category_id
        and category.status = 'published'
        and category.published_at <= now()
    )
  )
);

create policy "public can read media for published projects"
on public.project_media for select to anon, authenticated
using (
  exists (
    select 1 from public.projects project
    where project.id = project_media.project_id
      and project.status = 'published'
      and project.published_at <= now()
  )
  and exists (
    select 1 from public.media_assets asset
    where asset.id = project_media.media_asset_id
      and asset.visibility = 'public'
  )
);

create policy "public can read relations between published projects"
on public.project_related for select to anon, authenticated
using (
  exists (
    select 1 from public.projects project
    where project.id = project_related.project_id
      and project.status = 'published'
      and project.published_at <= now()
  )
  and exists (
    select 1 from public.projects related
    where related.id = project_related.related_project_id
      and related.status = 'published'
      and related.published_at <= now()
  )
);

create policy "public can read published pages"
on public.pages for select to anon, authenticated
using (status = 'published' and published_at <= now());

create policy "anonymous can submit safe enquiry fields"
on public.enquiries for insert to anon
with check (
  status = 'new'
  and assigned_to is null
  and client_ip is null
  and user_agent is null
  and consent = true
);

create policy "public can read seo for published subjects"
on public.seo_metadata for select to anon, authenticated
using (
  (
    subject_type = 'page'
    and exists (
      select 1 from public.pages page
      where page.id = seo_metadata.subject_id
        and page.status = 'published'
        and page.published_at <= now()
    )
  )
  or (
    subject_type = 'project'
    and exists (
      select 1 from public.projects project
      where project.id = seo_metadata.subject_id
        and project.status = 'published'
        and project.published_at <= now()
    )
  )
);

create policy "profiles deny public access"
on public.profiles for all to anon, authenticated using (false) with check (false);
create policy "site settings deny public access"
on public.site_settings for all to anon, authenticated using (false) with check (false);
create policy "enquiry events deny public access"
on public.enquiry_events for all to anon, authenticated using (false) with check (false);
create policy "redirects deny public access"
on public.redirects for all to anon, authenticated using (false) with check (false);
create policy "audit events deny public access"
on public.audit_events for all to anon, authenticated using (false) with check (false);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.media_assets from anon, authenticated;
revoke all on table public.project_categories from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_media from anon, authenticated;
revoke all on table public.project_related from anon, authenticated;
revoke all on table public.pages from anon, authenticated;
revoke all on table public.site_settings from anon, authenticated;
revoke all on table public.enquiries from anon, authenticated;
revoke all on table public.enquiry_events from anon, authenticated;
revoke all on table public.redirects from anon, authenticated;
revoke all on table public.seo_metadata from anon, authenticated;
revoke all on table public.audit_events from anon, authenticated;

grant select on table
  public.media_assets,
  public.project_categories,
  public.projects,
  public.project_media,
  public.project_related,
  public.pages,
  public.seo_metadata
to anon, authenticated;

grant insert (name, email, phone, message, source_page, consent)
on table public.enquiries to anon;

commit;
