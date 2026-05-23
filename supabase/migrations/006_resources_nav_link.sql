-- Add Resources nav link after Projects for existing CMS databases
insert into public.nav_links (label, href, display_order, visible)
select 'Resources', '/resources', 2, true
where not exists (
  select 1 from public.nav_links where href = '/resources'
);

-- Bump Leave a Note order when Resources was inserted
update public.nav_links
set display_order = 3
where href = '/leave-a-note'
  and display_order < 3
  and exists (select 1 from public.nav_links where href = '/resources' and display_order = 2);
