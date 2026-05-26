-- Add Lightroom Mobile Presets resource category
insert into public.resource_categories (name, slug, description, icon, featured, display_order)
values (
  'Lightroom Mobile Presets',
  'lightroom-mobile-presets',
  'Color grades and looks for Adobe Lightroom mobile',
  '◐',
  true,
  10
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  featured = excluded.featured,
  display_order = excluded.display_order;
