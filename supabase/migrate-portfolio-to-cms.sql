-- One-time copy: legacy portfolio tables → CMS tables
-- Safe to re-run: skips each section if the CMS table already has rows.
-- Run after 002_cms_schema.sql and portfolio seed.sql:
--   supabase db query --file supabase/migrate-portfolio-to-cms.sql --linked

-- ---------------------------------------------------------------------------
-- Projects: portfolio_projects → projects
-- ---------------------------------------------------------------------------
insert into public.projects (
  title,
  description,
  long_description,
  cover_image_url,
  tags,
  featured,
  display_order,
  status
)
select
  p.title,
  p.subtitle,
  p.subtitle,
  p.cover_src,
  array_remove(array[p.tag_left, p.tag_right], null),
  false,
  p.sort_order,
  case when p.is_published then 'published' else 'draft' end
from public.portfolio_projects p
where not exists (select 1 from public.projects limit 1)
order by p.sort_order;

-- Sync media_type from legacy portfolio rows (matched by title)
update public.projects cms
set media_type = pp.media_type::text
from public.portfolio_projects pp
where lower(trim(cms.title)) = lower(trim(pp.title))
  and pp.media_type is not null;

-- ---------------------------------------------------------------------------
-- Gallery: portfolio project_media → project_gallery_items (by title match)
-- Requires migration 004_project_gallery.sql
-- ---------------------------------------------------------------------------
insert into public.project_gallery_items (project_id, src, item_type, sort_order, alt_text)
select
  cms.id,
  pm.src,
  pm.item_type::text,
  pm.sort_order,
  pm.alt_text
from public.project_media pm
inner join public.portfolio_projects pp on pp.id = pm.project_id
inner join public.projects cms on lower(trim(cms.title)) = lower(trim(pp.title))
where not exists (select 1 from public.project_gallery_items limit 1)
order by cms.id, pm.sort_order;

-- ---------------------------------------------------------------------------
-- Testimonials: portfolio_testimonials → testimonials
-- ---------------------------------------------------------------------------
insert into public.testimonials (
  author_name,
  author_title,
  content,
  rating,
  status,
  display_order
)
select
  t.author,
  t.role,
  t.quote,
  5,
  case when t.is_published then 'approved' else 'rejected' end,
  t.sort_order
from public.portfolio_testimonials t
where not exists (select 1 from public.testimonials limit 1)
order by t.sort_order;

-- ---------------------------------------------------------------------------
-- Skills: portfolio_skills → skills
-- ---------------------------------------------------------------------------
insert into public.skills (name, category, level, display_order)
select
  s.label,
  'General',
  80,
  s.sort_order
from public.portfolio_skills s
where s.is_published
  and not exists (select 1 from public.skills limit 1)
order by s.sort_order;

-- ---------------------------------------------------------------------------
-- About bio: merge published paragraphs into about.bio (if about row exists)
-- ---------------------------------------------------------------------------
update public.about a
set bio = sub.bio
from (
  select string_agg(body, E'\n\n' order by sort_order) as bio
  from public.about_bio_paragraphs
  where is_published
) sub
where sub.bio is not null
  and (a.bio is null or trim(a.bio) = '');

-- ---------------------------------------------------------------------------
-- Hero fallback: first published home slide (only if hero has no background)
-- ---------------------------------------------------------------------------
update public.hero h
set background_value = s.src
from (
  select src
  from public.home_slides
  where is_published
  order by sort_order
  limit 1
) s
where (h.background_value is null or trim(h.background_value) = '')
  and s.src is not null;
