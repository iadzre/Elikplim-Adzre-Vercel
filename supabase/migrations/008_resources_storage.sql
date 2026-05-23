-- Resources Marketplace storage buckets & policies (008)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'resource-previews',
    'resource-previews',
    true,
    20971520,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'resource-files',
    'resource-files',
    false,
    524288000,
    array[
      'application/zip',
      'application/x-zip-compressed',
      'application/pdf',
      'application/octet-stream',
      'image/jpeg',
      'image/png',
      'video/mp4',
      'text/plain',
      'font/ttf',
      'font/otf'
    ]
  ),
  (
    'user-avatars',
    'user-avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- resource-previews: public read; creators upload under resources/{id}/
-- ---------------------------------------------------------------------------
drop policy if exists "resource_previews_public_read" on storage.objects;
create policy "resource_previews_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'resource-previews');

drop policy if exists "resource_previews_creator_insert" on storage.objects;
create policy "resource_previews_creator_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resource-previews'
    and (
      public.is_marketplace_admin()
      or (
        public.is_marketplace_creator()
        and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.owns_resource(((storage.foldername(name))[1])::uuid)
      )
    )
  );

drop policy if exists "resource_previews_creator_update" on storage.objects;
create policy "resource_previews_creator_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resource-previews'
    and (public.is_marketplace_admin() or public.is_marketplace_creator())
  );

drop policy if exists "resource_previews_creator_delete" on storage.objects;
create policy "resource_previews_creator_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resource-previews'
    and (public.is_marketplace_admin() or public.is_marketplace_creator())
  );

-- ---------------------------------------------------------------------------
-- resource-files: private; read only when user has resource access
-- Path convention: {resource_id}/{version}/{filename}
-- ---------------------------------------------------------------------------
drop policy if exists "resource_files_secure_read" on storage.objects;
create policy "resource_files_secure_read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and public.user_can_access_resource(((storage.foldername(name))[1])::uuid)
  );

-- Anon free resources: use signed URLs from Edge Function (service role) after RPC validation
-- Optional: allow anon read for free resources only
drop policy if exists "resource_files_anon_free_read" on storage.objects;
create policy "resource_files_anon_free_read"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and exists (
      select 1 from public.resources r
      where r.id = ((storage.foldername(name))[1])::uuid
        and r.status = 'published'
        and r.pricing_type = 'free'
    )
  );

drop policy if exists "resource_files_creator_insert" on storage.objects;
create policy "resource_files_creator_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resource-files'
    and (
      public.is_marketplace_admin()
      or (
        public.is_marketplace_creator()
        and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
        and public.owns_resource(((storage.foldername(name))[1])::uuid)
      )
    )
  );

drop policy if exists "resource_files_creator_update" on storage.objects;
create policy "resource_files_creator_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resource-files'
    and (public.is_marketplace_admin() or public.owns_resource(((storage.foldername(name))[1])::uuid))
  );

drop policy if exists "resource_files_creator_delete" on storage.objects;
create policy "resource_files_creator_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resource-files'
    and (public.is_marketplace_admin() or public.owns_resource(((storage.foldername(name))[1])::uuid))
  );

-- ---------------------------------------------------------------------------
-- user-avatars: public read; users write only their folder {user_id}/
-- ---------------------------------------------------------------------------
drop policy if exists "user_avatars_public_read" on storage.objects;
create policy "user_avatars_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'user-avatars');

drop policy if exists "user_avatars_owner_write" on storage.objects;
create policy "user_avatars_owner_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_avatars_owner_update" on storage.objects;
create policy "user_avatars_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "user_avatars_owner_delete" on storage.objects;
create policy "user_avatars_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'user-avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
