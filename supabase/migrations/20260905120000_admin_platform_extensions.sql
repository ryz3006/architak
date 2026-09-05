-- Admin platform: enquiry statuses, notification events, SEO versions, pages seed.

begin;

-- Extend enquiry status lifecycle
alter table public.enquiries drop constraint if exists enquiries_status_check;
alter table public.enquiries
  add constraint enquiries_status_check
  check (status in ('new', 'contacted', 'in_discussion', 'qualified', 'converted', 'closed', 'spam'));

alter table public.enquiry_events drop constraint if exists enquiry_events_from_status_check;
alter table public.enquiry_events drop constraint if exists enquiry_events_to_status_check;
alter table public.enquiry_events drop constraint if exists enquiry_events_event_type_check;

alter table public.enquiry_events
  add constraint enquiry_events_from_status_check
  check (
    from_status is null
    or from_status in ('new', 'contacted', 'in_discussion', 'qualified', 'converted', 'closed', 'spam')
  );

alter table public.enquiry_events
  add constraint enquiry_events_to_status_check
  check (
    to_status is null
    or to_status in ('new', 'contacted', 'in_discussion', 'qualified', 'converted', 'closed', 'spam')
  );

alter table public.enquiry_events
  add constraint enquiry_events_event_type_check
  check (
    event_type in (
      'created',
      'status_changed',
      'assigned',
      'note_added',
      'notification_queued',
      'notification_sent',
      'notification_failed'
    )
  );

-- SEO version history (max 20 enforced in application)
create table if not exists public.seo_versions (
  id bigint generated always as identity primary key,
  seo_metadata_id uuid not null references public.seo_metadata (id) on delete cascade,
  version_number integer not null check (version_number > 0),
  title text,
  description text,
  canonical_url text,
  robots text,
  open_graph jsonb not null default '{}'::jsonb check (jsonb_typeof(open_graph) = 'object'),
  structured_data jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_data) = 'object'),
  ai_summary text,
  quality_score integer check (quality_score is null or (quality_score >= 0 and quality_score <= 100)),
  changed_by text,
  change_summary text,
  created_at timestamptz not null default now(),
  unique (seo_metadata_id, version_number),
  check (title is null or char_length(title) <= 200),
  check (description is null or char_length(description) <= 500),
  check (change_summary is null or char_length(change_summary) <= 500)
);

create index if not exists seo_versions_metadata_idx
  on public.seo_versions (seo_metadata_id, version_number desc);

alter table public.seo_versions enable row level security;

drop policy if exists "seo versions deny public access" on public.seo_versions;
create policy "seo versions deny public access"
  on public.seo_versions for all to anon, authenticated
  using (false) with check (false);

revoke all on table public.seo_versions from anon, authenticated;

-- Seed published page rows for SEO subject references
insert into public.pages (slug, title, content, status, published_at)
values
  ('home', 'Home', '{}'::jsonb, 'published', now()),
  ('studio', 'Studio', '{}'::jsonb, 'published', now()),
  ('services', 'Services', '{}'::jsonb, 'published', now()),
  ('contact', 'Contact', '{}'::jsonb, 'published', now())
on conflict (slug) do update
set title = excluded.title,
    status = excluded.status,
    published_at = coalesce(public.pages.published_at, excluded.published_at);

-- Seed SEO metadata from current defaults (idempotent)
insert into public.seo_metadata (subject_type, subject_id, title, description, open_graph)
select
  'page',
  p.id,
  case p.slug
    when 'home' then 'Interior Design Studio in Kochi'
    when 'studio' then 'Studio — Belief, Work & Practice'
    when 'services' then 'Interior Design Services in Kochi'
    when 'contact' then 'Contact — Let''s Connect'
  end,
  case p.slug
    when 'home' then 'CREATED TO CREATE. Interior design studio in Vyttila, Kochi — residential, hospitality, corporate, and commercial spaces that become part of how you live.'
    when 'studio' then 'Enter the ARCHITAK studio — what we believe, what we create, the spaces we have shaped, and how life becomes form in Vyttila, Kochi.'
    when 'services' then 'ARCHITAK services — hospitality, residential, corporate, restaurant, commercial, and industrial interior design in Kochi.'
    when 'contact' then 'Contact ARCHITAK in Vyttila, Kochi — phone, email, WhatsApp, and project enquiry. Every space starts with a conversation.'
  end,
  jsonb_build_object('path', case p.slug when 'home' then '/' else '/' || p.slug end)
from public.pages p
where p.slug in ('home', 'studio', 'services', 'contact')
on conflict do nothing;

insert into public.seo_metadata (subject_type, subject_id, title, description, open_graph)
values (
  'global',
  null,
  'ARCHITAK',
  'CREATED TO CREATE — interior design studio in Vyttila, Kochi.',
  '{"titleTemplate":"%s · ARCHITAK"}'::jsonb
)
on conflict do nothing;

-- Project testimonials (optional CMS)
create table if not exists public.project_testimonials (
  id uuid primary key default extensions.gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  quote text not null,
  author_name text not null,
  author_role text,
  location text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(btrim(quote)) between 1 and 2000),
  check (char_length(btrim(author_name)) between 1 and 120),
  check (author_role is null or char_length(author_role) <= 120),
  check (location is null or char_length(location) <= 120)
);

create index if not exists project_testimonials_project_idx
  on public.project_testimonials (project_id, sort_order);

create trigger project_testimonials_set_updated_at
  before update on public.project_testimonials
  for each row execute function public.set_updated_at();

alter table public.project_testimonials enable row level security;

drop policy if exists "public can read enabled testimonials for published projects" on public.project_testimonials;
create policy "public can read enabled testimonials for published projects"
on public.project_testimonials for select to anon, authenticated
using (
  is_enabled = true
  and exists (
    select 1 from public.projects project
    where project.id = project_testimonials.project_id
      and project.status = 'published'
      and project.published_at <= now()
  )
);

revoke all on table public.project_testimonials from anon, authenticated;
grant select on table public.project_testimonials to anon, authenticated;

commit;
