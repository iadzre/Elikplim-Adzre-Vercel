-- Optional CMS seed (run after 002_cms_schema.sql)

insert into public.hero (headline, subheadline, cta_text, cta_link, background_type, background_value)
select
  'Elikplim Adzre',
  'Illustrator · Filmmaker · Photographer · Storyteller',
  'View Projects',
  '/projects',
  'image',
  '/images/slider/_DSF2248.jpg'
where not exists (select 1 from public.hero limit 1);

insert into public.about (name, title, bio, email, phone, location)
select
  'Elikplim Adzre',
  'Illustrator | Filmmaker | Photographer | Storyteller',
  'Creative and detail-oriented video, motion graphics, and graphic designer.',
  'iadzre@gmail.com',
  '+233546335150',
  'Ghana'
where not exists (select 1 from public.about limit 1);

insert into public.nav_links (label, href, display_order, visible)
select * from (values
  ('About Me', '/about', 0, true),
  ('Projects', '/projects', 1, true),
  ('Leave a Note', '/leave-a-note', 2, true)
) as v(label, href, display_order, visible)
where not exists (select 1 from public.nav_links limit 1);

insert into public.contact_info (platform, label, value, icon, display_order, visible)
select * from (values
  ('Email', 'Email', 'iadzre@gmail.com', '✉', 0, true),
  ('Phone', 'Phone', '+233 (0) 54-633-5150', '☎', 1, true),
  ('Instagram', 'Instagram', 'https://www.instagram.com/still_eli/', '📷', 2, true),
  ('YouTube', 'YouTube', 'https://www.youtube.com/@eli_kplim', '▶', 3, true),
  ('Facebook', 'Facebook', 'https://web.facebook.com/elikplim.cine', 'f', 4, true),
  ('LinkedIn', 'LinkedIn', 'https://www.linkedin.com/in/elikplim-adzre-62219997/', 'in', 5, true)
) as v(platform, label, value, icon, display_order, visible)
where not exists (select 1 from public.contact_info limit 1);
