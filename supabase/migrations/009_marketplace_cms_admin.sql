-- Allow existing CMS authenticated users to manage the shop (matches portfolio CMS pattern)

-- ---------------------------------------------------------------------------
-- Table RLS: authenticated full manage / read
-- ---------------------------------------------------------------------------
drop policy if exists "resources_authenticated_manage" on public.resources;
create policy "resources_authenticated_manage"
  on public.resources for all to authenticated
  using (true) with check (true);

drop policy if exists "resource_categories_authenticated_manage" on public.resource_categories;
create policy "resource_categories_authenticated_manage"
  on public.resource_categories for all to authenticated
  using (true) with check (true);

drop policy if exists "resource_files_authenticated_manage" on public.resource_files;
create policy "resource_files_authenticated_manage"
  on public.resource_files for all to authenticated
  using (true) with check (true);

drop policy if exists "purchases_authenticated_manage" on public.purchases;
create policy "purchases_authenticated_manage"
  on public.purchases for all to authenticated
  using (true) with check (true);

drop policy if exists "downloads_authenticated_read" on public.downloads;
create policy "downloads_authenticated_read"
  on public.downloads for select to authenticated
  using (true);

drop policy if exists "reviews_authenticated_manage" on public.reviews;
create policy "reviews_authenticated_manage"
  on public.reviews for all to authenticated
  using (true) with check (true);

drop policy if exists "favorites_authenticated_read" on public.favorites;
create policy "favorites_authenticated_read"
  on public.favorites for select to authenticated
  using (true);

drop policy if exists "newsletters_authenticated_read" on public.newsletters;
create policy "newsletters_authenticated_read"
  on public.newsletters for select to authenticated
  using (true);

drop policy if exists "resource_events_authenticated_read" on public.resource_events;
create policy "resource_events_authenticated_read"
  on public.resource_events for select to authenticated
  using (true);

drop policy if exists "profiles_authenticated_manage" on public.profiles;
create policy "profiles_authenticated_manage"
  on public.profiles for all to authenticated
  using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Storage: CMS uploads without marketplace creator role
-- ---------------------------------------------------------------------------
drop policy if exists "resource_previews_cms_insert" on storage.objects;
create policy "resource_previews_cms_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resource-previews' and auth.uid() is not null);

drop policy if exists "resource_previews_cms_update" on storage.objects;
create policy "resource_previews_cms_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'resource-previews' and auth.uid() is not null);

drop policy if exists "resource_previews_cms_delete" on storage.objects;
create policy "resource_previews_cms_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resource-previews' and auth.uid() is not null);

drop policy if exists "resource_files_cms_insert" on storage.objects;
create policy "resource_files_cms_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'resource-files' and auth.uid() is not null);

drop policy if exists "resource_files_cms_read" on storage.objects;
create policy "resource_files_cms_read"
  on storage.objects for select to authenticated
  using (bucket_id = 'resource-files' and auth.uid() is not null);

drop policy if exists "resource_files_cms_update" on storage.objects;
create policy "resource_files_cms_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'resource-files' and auth.uid() is not null);

drop policy if exists "resource_files_cms_delete" on storage.objects;
create policy "resource_files_cms_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'resource-files' and auth.uid() is not null);
