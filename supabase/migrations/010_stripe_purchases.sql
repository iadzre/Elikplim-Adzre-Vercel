-- Stripe checkout fields + idempotent purchase completion (010)

alter table public.purchases
  add column if not exists stripe_session_id text;

create unique index if not exists purchases_stripe_session_id_uidx
  on public.purchases (stripe_session_id)
  where stripe_session_id is not null;

create or replace function public.set_purchase_stripe_session(
  p_purchase_id uuid,
  p_stripe_session_id text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  update public.purchases
  set
    stripe_session_id = p_stripe_session_id,
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('stripe_session_id', p_stripe_session_id)
  where id = p_purchase_id
    and user_id = auth.uid()
    and payment_status = 'pending';
end;
$$;

grant execute on function public.set_purchase_stripe_session(uuid, text) to authenticated;

create or replace function public.complete_resource_purchase(
  p_purchase_id uuid default null,
  p_transaction_id text default null,
  p_stripe_session_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase_id uuid;
  v_rows integer;
begin
  if p_purchase_id is null and p_stripe_session_id is null then
    raise exception 'purchase_reference_required';
  end if;

  select id into v_purchase_id
  from public.purchases
  where (
    (p_purchase_id is not null and id = p_purchase_id)
    or (p_stripe_session_id is not null and stripe_session_id = p_stripe_session_id)
  )
  limit 1;

  if v_purchase_id is null then
    raise exception 'purchase_not_found';
  end if;

  -- Idempotent: already completed
  if exists (
    select 1 from public.purchases
    where id = v_purchase_id and payment_status = 'completed'
  ) then
    return v_purchase_id;
  end if;

  update public.purchases
  set
    payment_status = 'completed',
    transaction_id = coalesce(p_transaction_id, transaction_id),
    stripe_session_id = coalesce(p_stripe_session_id, stripe_session_id),
    purchased_at = coalesce(purchased_at, now())
  where id = v_purchase_id
    and payment_status in ('pending', 'failed');

  get diagnostics v_rows = row_count;
  if v_rows = 0 then
    raise exception 'purchase_not_completable';
  end if;

  return v_purchase_id;
end;
$$;

revoke execute on function public.complete_resource_purchase(uuid, text, text) from public;
grant execute on function public.complete_resource_purchase(uuid, text, text) to service_role;

create or replace function public.fail_resource_purchase(
  p_stripe_session_id text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.purchases
  set
    payment_status = 'failed',
    metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object('failure_reason', coalesce(p_reason, 'unknown'))
  where stripe_session_id = p_stripe_session_id
    and payment_status = 'pending';
end;
$$;

revoke execute on function public.fail_resource_purchase(text, text) from public;
grant execute on function public.fail_resource_purchase(text, text) to service_role;

create or replace function public.count_search_resources(
  p_query text default null,
  p_category_slug text default null,
  p_pricing_type public.pricing_type default null,
  p_featured_only boolean default false
)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.search_resources(
    p_query,
    p_category_slug,
    p_pricing_type,
    p_featured_only,
    'newest',
    10000,
    0
  ) s;
$$;

grant execute on function public.count_search_resources(text, text, public.pricing_type, boolean) to anon, authenticated;

create or replace function public.user_owns_resource(p_resource_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_can_access_resource(p_resource_id, p_user_id);
$$;

grant execute on function public.user_owns_resource(uuid, uuid) to anon, authenticated;
