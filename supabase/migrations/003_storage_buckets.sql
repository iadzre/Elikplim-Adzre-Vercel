-- Storage buckets for CMS media uploads
-- Public read; authenticated (admin) write only

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'hero-backgrounds',
    'hero-backgrounds',
    true,
    52428800,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
  ),
  (
    'project-covers',
    'project-covers',
    true,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'profile-images',
    'profile-images',
    true,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'testimonial-avatars',
    'testimonial-avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read on all CMS buckets
drop policy if exists "cms_storage_public_read" on storage.objects;
create policy "cms_storage_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'profile-images',
    'testimonial-avatars'
  ));

-- Admin upload / update / delete
drop policy if exists "cms_storage_admin_insert" on storage.objects;
create policy "cms_storage_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'profile-images',
    'testimonial-avatars'
  ));

drop policy if exists "cms_storage_admin_update" on storage.objects;
create policy "cms_storage_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'profile-images',
    'testimonial-avatars'
  ));

drop policy if exists "cms_storage_admin_delete" on storage.objects;
create policy "cms_storage_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'profile-images',
    'testimonial-avatars'
  ));
