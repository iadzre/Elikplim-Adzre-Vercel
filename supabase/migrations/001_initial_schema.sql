-- Elikplim Adzre portfolio — initial schema
-- Run in Supabase SQL editor or via CLI: supabase db reset

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.project_media_type as enum ('image', 'video', 'mixed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.media_item_type as enum ('image', 'video');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.timeline_position as enum ('top', 'bottom');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Contact form (public insert only; PII — no public read)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 1),
  email text not null check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  topic text not null check (char_length(trim(topic)) >= 1),
  message text not null check (char_length(trim(message)) >= 1),
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- Client testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  author text not null,
  role text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists testimonials_published_sort_idx
  on public.testimonials (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- Portfolio projects + gallery media (FK)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id text primary key,
  title text not null,
  subtitle text not null,
  tag_left text not null,
  tag_right text not null,
  cover_src text not null,
  cover_alt text not null,
  media_type public.project_media_type not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_published_sort_idx
  on public.projects (is_published, sort_order);

-- Remove legacy denormalized column if upgrading from an earlier draft
alter table public.projects drop column if exists media_srcs;

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.projects (id) on delete cascade,
  src text not null,
  item_type public.media_item_type not null,
  sort_order int not null default 0,
  alt_text text,
  created_at timestamptz not null default now(),
  unique (project_id, sort_order)
);

create index if not exists project_media_project_sort_idx
  on public.project_media (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- Home page hero slider
-- ---------------------------------------------------------------------------
create table if not exists public.home_slides (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt_text text not null default '',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists home_slides_published_sort_idx
  on public.home_slides (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- About page — bio paragraphs & skills
-- ---------------------------------------------------------------------------
create table if not exists public.about_bio_paragraphs (
  id uuid primary key default gen_random_uuid(),
  body text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists about_bio_published_sort_idx
  on public.about_bio_paragraphs (is_published, sort_order);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skills_published_sort_idx
  on public.skills (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- About page — career timeline
-- ---------------------------------------------------------------------------
create table if not exists public.career_timeline_entries (
  id uuid primary key default gen_random_uuid(),
  position public.timeline_position not null,
  left_offset text not null,
  period text not null,
  title text not null,
  detail text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_timeline_published_sort_idx
  on public.career_timeline_entries (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists home_slides_set_updated_at on public.home_slides;
create trigger home_slides_set_updated_at
  before update on public.home_slides
  for each row execute function public.set_updated_at();

drop trigger if exists about_bio_set_updated_at on public.about_bio_paragraphs;
create trigger about_bio_set_updated_at
  before update on public.about_bio_paragraphs
  for each row execute function public.set_updated_at();

drop trigger if exists skills_set_updated_at on public.skills;
create trigger skills_set_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

drop trigger if exists career_timeline_set_updated_at on public.career_timeline_entries;
create trigger career_timeline_set_updated_at
  before update on public.career_timeline_entries
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.contact_submissions enable row level security;
alter table public.testimonials enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.home_slides enable row level security;
alter table public.about_bio_paragraphs enable row level security;
alter table public.skills enable row level security;
alter table public.career_timeline_entries enable row level security;

-- Contact: anonymous submit only
drop policy if exists "contact_anon_insert" on public.contact_submissions;
create policy "contact_anon_insert"
  on public.contact_submissions for insert
  to anon, authenticated
  with check (true);

drop policy if exists "contact_deny_public_select" on public.contact_submissions;
create policy "contact_deny_public_select"
  on public.contact_submissions for select
  to anon, authenticated
  using (false);

drop policy if exists "contact_authenticated_select" on public.contact_submissions;
create policy "contact_authenticated_select"
  on public.contact_submissions for select
  to authenticated
  using (true);

-- Published content: public read
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read"
  on public.testimonials for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read"
  on public.projects for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "project_media_public_read" on public.project_media;
create policy "project_media_public_read"
  on public.project_media for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.is_published = true
    )
  );

drop policy if exists "home_slides_public_read" on public.home_slides;
create policy "home_slides_public_read"
  on public.home_slides for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "about_bio_public_read" on public.about_bio_paragraphs;
create policy "about_bio_public_read"
  on public.about_bio_paragraphs for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read"
  on public.skills for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "career_timeline_public_read" on public.career_timeline_entries;
create policy "career_timeline_public_read"
  on public.career_timeline_entries for select
  to anon, authenticated
  using (is_published = true);

-- CMS tables: authenticated write (admin dashboard / Supabase Auth users)
drop policy if exists "testimonials_authenticated_write" on public.testimonials;
create policy "testimonials_authenticated_write"
  on public.testimonials for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "projects_authenticated_write" on public.projects;
create policy "projects_authenticated_write"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "project_media_authenticated_write" on public.project_media;
create policy "project_media_authenticated_write"
  on public.project_media for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "home_slides_authenticated_write" on public.home_slides;
create policy "home_slides_authenticated_write"
  on public.home_slides for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "about_bio_authenticated_write" on public.about_bio_paragraphs;
create policy "about_bio_authenticated_write"
  on public.about_bio_paragraphs for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "skills_authenticated_write" on public.skills;
create policy "skills_authenticated_write"
  on public.skills for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "career_timeline_authenticated_write" on public.career_timeline_entries;
create policy "career_timeline_authenticated_write"
  on public.career_timeline_entries for all
  to authenticated
  using (true)
  with check (true);
