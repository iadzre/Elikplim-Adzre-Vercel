-- Replace seed placeholder stats with values derived from real activity.

update public.resources r
set
  download_count = (
    select count(*)::integer
    from public.downloads d
    where d.resource_id = r.id
  ),
  rating_average = coalesce((
    select round(avg(rv.rating)::numeric, 2)
    from public.reviews rv
    where rv.resource_id = r.id
      and rv.approved = true
  ), 0),
  rating_count = (
    select count(*)::integer
    from public.reviews rv
    where rv.resource_id = r.id
      and rv.approved = true
  );

-- Keep aggregates in sync if rows are ever backfilled manually.
create or replace function public.refresh_resource_download_count(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.resources
  set download_count = (
    select count(*)::integer
    from public.downloads d
    where d.resource_id = p_resource_id
  )
  where id = p_resource_id;
end;
$$;

grant execute on function public.refresh_resource_download_count(uuid) to authenticated;
