-- CMS project gallery (modal images/videos), linked to public.projects (UUID)

-- ---------------------------------------------------------------------------
-- Project-level gallery mode (image / video / mixed)
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists media_type text
  check (media_type in ('image', 'video', 'mixed'))
  default 'image';

-- ---------------------------------------------------------------------------
-- Gallery items (one row per image or video in the project modal)
-- ---------------------------------------------------------------------------
create table if not exists public.project_gallery_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  src text not null,
  item_type text not null check (item_type in ('image', 'video')) default 'image',
  sort_order int not null default 0,
  alt_text text,
  created_at timestamptz not null default now()
);

create index if not exists project_gallery_items_project_sort_idx
  on public.project_gallery_items (project_id, sort_order);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.project_gallery_items enable row level security;

drop policy if exists "project_gallery_public_read" on public.project_gallery_items;
create policy "project_gallery_public_read"
  on public.project_gallery_items for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.projects p
      where p.id = project_id
        and p.status = 'published'
    )
  );

drop policy if exists "project_gallery_admin_all" on public.project_gallery_items;
create policy "project_gallery_admin_all"
  on public.project_gallery_items for all
  to authenticated
  using (true)
  with check (true);
