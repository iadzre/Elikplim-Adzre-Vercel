-- Editorial hero copy for Elikplim Adzre portfolio (Primland-style hierarchy)
-- subheadline format: STRONG|soft::descriptor (parsed by parseHeroDisplay.js)

update public.hero
set
  headline = 'Elikplim Adzre',
  subheadline = 'WELCOME TO THE WORK|of::A journey through illustration, film, photography, and visual storytelling.',
  cta_text = 'Explore projects',
  cta_link = '/projects',
  updated_at = now()
where id = (select id from public.hero limit 1);
