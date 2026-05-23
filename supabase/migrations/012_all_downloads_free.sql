-- Temporary: open downloads for all published resources (re-enable paid later).

update public.resources
set
  pricing_type = 'free',
  price = 0,
  compare_at_price = null
where pricing_type = 'paid';

create or replace function public.user_can_access_resource(p_resource_id uuid, p_user_id uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_resource public.resources%rowtype;
begin
  select * into v_resource from public.resources where id = p_resource_id;
  if not found or v_resource.status <> 'published' then
    return false;
  end if;

  -- TEMPORARY: all published resources are downloadable without purchase.
  return true;
end;
$$;

grant execute on function public.user_can_access_resource(uuid, uuid) to anon, authenticated;

-- Anon signed URLs: align with user_can_access_resource (not pricing_type = 'free' only).
drop policy if exists "resource_files_anon_free_read" on storage.objects;
create policy "resource_files_anon_free_read"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'resource-files'
    and (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
    and public.user_can_access_resource(((storage.foldername(name))[1])::uuid, null)
  );
