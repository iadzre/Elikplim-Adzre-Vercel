-- One-time conversion: turn all legacy "Leave a Note" submissions
-- (public.contact_submissions) into pending testimonials so they can be
-- reviewed/approved alongside new testimonial submissions.
--
-- Mapping: name -> author_name, topic -> author_title, message -> content.
-- Email is not carried over (testimonials have no email column). Rows are moved
-- (inserted then deleted), so re-running this migration is a no-op.

insert into public.testimonials (author_name, author_title, content, rating, status, created_at)
select
  coalesce(nullif(trim(cs.name), ''), 'Anonymous'),
  nullif(trim(cs.topic), ''),
  cs.message,
  5,
  'pending',
  cs.created_at
from public.contact_submissions cs
where coalesce(trim(cs.message), '') <> '';

delete from public.contact_submissions;
