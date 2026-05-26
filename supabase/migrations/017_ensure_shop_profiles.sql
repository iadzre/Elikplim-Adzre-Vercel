-- Shop resources.creator_id → profiles(id). CMS admins created before marketplace
-- signup may lack a profile row; ensure one exists before insert/update.

-- Backfill any auth user missing a profile (safe to re-run).
insert into public.profiles (id, full_name, role)
select
  u.id,
  coalesce(
    u.raw_user_meta_data ->> 'full_name',
    u.raw_user_meta_data ->> 'name',
    nullif(split_part(u.email, '@', 1), '')
  ),
  case
    when exists (
      select 1
      from public.site_settings s
      where s.key = 'marketplace_admin_emails'
        and u.email = any (
          select trim(both from unnest(string_to_array(s.value, ',')))
        )
    ) then 'admin'::public.profile_role
    else 'creator'::public.profile_role
  end
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

create or replace function public.ensure_my_profile()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_meta jsonb;
  v_role public.profile_role := 'creator';
begin
  if v_uid is null then
    return null;
  end if;

  select u.email, u.raw_user_meta_data
  into v_email, v_meta
  from auth.users u
  where u.id = v_uid;

  if exists (
    select 1
    from public.site_settings s
    where s.key = 'marketplace_admin_emails'
      and v_email is not null
      and v_email = any (
        select trim(both from unnest(string_to_array(s.value, ',')))
      )
  ) then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, role)
  values (
    v_uid,
    coalesce(
      v_meta ->> 'full_name',
      v_meta ->> 'name',
      nullif(split_part(v_email, '@', 1), '')
    ),
    v_role
  )
  on conflict (id) do nothing;

  return v_uid;
end;
$$;

grant execute on function public.ensure_my_profile() to authenticated;
