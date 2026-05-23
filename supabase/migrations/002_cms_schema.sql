-- CMS admin dashboard schema (002)
-- Renames live portfolio tables from 001 so CMS tables can use canonical names.

-- ---------------------------------------------------------------------------
-- Preserve portfolio site tables (public site reads these)
-- ---------------------------------------------------------------------------
do $$ begin
  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'projects'
  ) and not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'portfolio_projects'
  ) then
    alter table public.projects rename to portfolio_projects;
  end if;

  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'testimonials'
  ) and not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'portfolio_testimonials'
  ) then
    alter table public.testimonials rename to portfolio_testimonials;
  end if;

  if exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'skills'
  ) and not exists (
    select 1 from pg_tables
    where schemaname = 'public' and tablename = 'portfolio_skills'
  ) then
    alter table public.skills rename to portfolio_skills;
  end if;
end $$;

alter table if exists public.project_media
  drop constraint if exists project_media_project_id_fkey;

alter table if exists public.project_media
  add constraint project_media_project_id_fkey
  foreign key (project_id) references public.portfolio_projects (id) on delete cascade;

-- Drop old RLS policies on renamed tables (policy names stay on renamed tables)
-- Policies move with table rename in Postgres — no action needed.

-- ---------------------------------------------------------------------------
-- HERO SECTION
-- ---------------------------------------------------------------------------
create table if not exists public.hero (
  id uuid default gen_random_uuid() primary key,
  headline text not null,
  subheadline text,
  cta_text text,
  cta_link text,
  background_type text check (background_type in ('image', 'video', 'color', 'gradient')) default 'image',
  background_value text,
  overlay_opacity numeric default 0.5,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- ABOUT SECTION
-- ---------------------------------------------------------------------------
create table if not exists public.about (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  title text,
  bio text,
  profile_image_url text,
  cv_url text,
  email text,
  phone text,
  location text,
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- PROJECTS (CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  long_description text,
  cover_image_url text,
  tags text[],
  live_url text,
  github_url text,
  featured boolean default false,
  display_order integer default 0,
  status text check (status in ('published', 'draft')) default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_cms_status_order_idx
  on public.projects (status, display_order);

-- ---------------------------------------------------------------------------
-- SKILLS (CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text,
  level integer check (level between 0 and 100),
  icon_url text,
  display_order integer default 0
);

create index if not exists skills_cms_order_idx on public.skills (display_order);

-- ---------------------------------------------------------------------------
-- TESTIMONIALS / COMMENTS (CMS)
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  author_title text,
  author_image_url text,
  content text not null,
  rating integer check (rating between 1 and 5),
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  display_order integer default 0,
  created_at timestamptz default now()
);

create index if not exists testimonials_cms_status_order_idx
  on public.testimonials (status, display_order);

-- ---------------------------------------------------------------------------
-- CONTACT / SOCIAL LINKS
-- ---------------------------------------------------------------------------
create table if not exists public.contact_info (
  id uuid default gen_random_uuid() primary key,
  platform text not null,
  value text not null,
  label text,
  icon text,
  display_order integer default 0,
  visible boolean default true
);

create index if not exists contact_info_visible_order_idx
  on public.contact_info (visible, display_order);

-- ---------------------------------------------------------------------------
-- NAVIGATION LINKS
-- ---------------------------------------------------------------------------
create table if not exists public.nav_links (
  id uuid default gen_random_uuid() primary key,
  label text not null,
  href text not null,
  display_order integer default 0,
  visible boolean default true
);

create index if not exists nav_links_visible_order_idx
  on public.nav_links (visible, display_order);

-- ---------------------------------------------------------------------------
-- SITE SETTINGS (global key/value)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

insert into public.site_settings (key, value) values
  ('site_title', 'Elikplim Adzre'),
  ('meta_description', ''),
  ('favicon_url', '/favicon.ico'),
  ('footer_text', ''),
  ('primary_color', '#000000'),
  ('accent_color', '#ffffff')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- updated_at triggers (CMS tables)
-- ---------------------------------------------------------------------------
drop trigger if exists hero_set_updated_at on public.hero;
create trigger hero_set_updated_at
  before update on public.hero
  for each row execute function public.set_updated_at();

drop trigger if exists about_set_updated_at on public.about;
create trigger about_set_updated_at
  before update on public.about
  for each row execute function public.set_updated_at();

drop trigger if exists projects_cms_set_updated_at on public.projects;
create trigger projects_cms_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — CMS tables
-- ---------------------------------------------------------------------------
alter table public.hero enable row level security;
alter table public.about enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.testimonials enable row level security;
alter table public.contact_info enable row level security;
alter table public.nav_links enable row level security;
alter table public.site_settings enable row level security;

-- hero / about / skills / site_settings: public read (no status column)
drop policy if exists "hero_public_read" on public.hero;
create policy "hero_public_read"
  on public.hero for select to anon, authenticated using (true);

drop policy if exists "about_public_read" on public.about;
create policy "about_public_read"
  on public.about for select to anon, authenticated using (true);

drop policy if exists "skills_cms_public_read" on public.skills;
create policy "skills_cms_public_read"
  on public.skills for select to anon, authenticated using (true);

drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select to anon, authenticated using (true);

-- projects: published only for public
drop policy if exists "projects_cms_public_read" on public.projects;
create policy "projects_cms_public_read"
  on public.projects for select to anon, authenticated
  using (status = 'published');

-- contact_info / nav_links: visible only
drop policy if exists "contact_info_public_read" on public.contact_info;
create policy "contact_info_public_read"
  on public.contact_info for select to anon, authenticated
  using (visible = true);

drop policy if exists "nav_links_public_read" on public.nav_links;
create policy "nav_links_public_read"
  on public.nav_links for select to anon, authenticated
  using (visible = true);

-- testimonials: approved read; anon can submit pending
drop policy if exists "testimonials_cms_public_read" on public.testimonials;
create policy "testimonials_cms_public_read"
  on public.testimonials for select to anon, authenticated
  using (status = 'approved');

drop policy if exists "testimonials_anon_insert" on public.testimonials;
create policy "testimonials_anon_insert"
  on public.testimonials for insert to anon, authenticated
  with check (status = 'pending');

-- authenticated admin: full CMS access
drop policy if exists "hero_admin_all" on public.hero;
create policy "hero_admin_all"
  on public.hero for all to authenticated using (true) with check (true);

drop policy if exists "about_admin_all" on public.about;
create policy "about_admin_all"
  on public.about for all to authenticated using (true) with check (true);

drop policy if exists "projects_cms_admin_all" on public.projects;
create policy "projects_cms_admin_all"
  on public.projects for all to authenticated using (true) with check (true);

drop policy if exists "skills_cms_admin_all" on public.skills;
create policy "skills_cms_admin_all"
  on public.skills for all to authenticated using (true) with check (true);

drop policy if exists "testimonials_cms_admin_all" on public.testimonials;
create policy "testimonials_cms_admin_all"
  on public.testimonials for all to authenticated using (true) with check (true);

drop policy if exists "contact_info_admin_all" on public.contact_info;
create policy "contact_info_admin_all"
  on public.contact_info for all to authenticated using (true) with check (true);

drop policy if exists "nav_links_admin_all" on public.nav_links;
create policy "nav_links_admin_all"
  on public.nav_links for all to authenticated using (true) with check (true);

drop policy if exists "site_settings_admin_all" on public.site_settings;
create policy "site_settings_admin_all"
  on public.site_settings for all to authenticated using (true) with check (true);
