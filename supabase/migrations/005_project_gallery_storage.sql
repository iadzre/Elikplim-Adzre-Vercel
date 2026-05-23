-- Storage bucket for CMS project gallery uploads (images + videos)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-gallery',
  'project-gallery',
  true,
  104857600,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "cms_storage_public_read" on storage.objects;
create policy "cms_storage_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'project-gallery',
    'profile-images',
    'testimonial-avatars'
  ));

drop policy if exists "cms_storage_admin_insert" on storage.objects;
create policy "cms_storage_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id in (
    'hero-backgrounds',
    'project-covers',
    'project-gallery',
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
    'project-gallery',
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
    'project-gallery',
    'profile-images',
    'testimonial-avatars'
  ));
