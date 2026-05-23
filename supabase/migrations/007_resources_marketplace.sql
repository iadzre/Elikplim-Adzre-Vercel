-- Resources Marketplace — production schema, RLS, triggers, RPC (007)
-- Requires: auth.users, public.set_updated_at() from 001

-- ---------------------------------------------------------------------------
-- Extensions & enums
-- ---------------------------------------------------------------------------
create extension if not exists pg_trgm;

do $$ begin
  create type public.profile_role as enum ('admin', 'creator', 'customer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.resource_status as enum ('draft', 'published', 'archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pricing_type as enum ('free', 'paid');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (auth.users 1:1)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  role public.profile_role not null default 'customer',
  verified boolean not null default false,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-z0-9_]{3,30}$'
  ),
  constraint profiles_website_format check (
    website is null or website ~ '^https?://'
  )
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_username_idx on public.profiles (username) where username is not null;

-- ---------------------------------------------------------------------------
-- Resource categories
-- ---------------------------------------------------------------------------
create table if not exists public.resource_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  featured boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint resource_categories_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists resource_categories_featured_order_idx
  on public.resource_categories (featured desc, display_order asc);

-- ---------------------------------------------------------------------------
-- Resources
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  full_description text,
  thumbnail_url text,
  preview_images text[] not null default '{}',
  preview_video_url text,
  category_id uuid references public.resource_categories (id) on delete set null,
  creator_id uuid references public.profiles (id) on delete set null,
  pricing_type public.pricing_type not null default 'free',
  price numeric(10, 2) not null default 0 check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  currency char(3) not null default 'USD',
  featured boolean not null default false,
  status public.resource_status not null default 'draft',
  file_size bigint check (file_size is null or file_size >= 0),
  file_formats text[] not null default '{}',
  compatibility text[] not null default '{}',
  license_type text not null default 'standard',
  tags text[] not null default '{}',
  download_count integer not null default 0 check (download_count >= 0),
  view_count integer not null default 0 check (view_count >= 0),
  rating_average numeric(3, 2) not null default 0 check (rating_average >= 0 and rating_average <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  max_downloads_per_day integer not null default 50 check (max_downloads_per_day > 0),
  seo_title text,
  seo_description text,
  -- Maintained by trigger (english tsvector is not immutable for GENERATED columns)
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint resources_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint resources_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint resources_paid_price check (
    pricing_type = 'free' or price > 0
  ),
  constraint resources_published_at check (
    status <> 'published' or published_at is not null
  )
);

-- Full-text search: trigger (to_tsvector('english', …) is not immutable for GENERATED columns)
create or replace function public.resources_build_search_vector(
  p_title text,
  p_short_description text,
  p_full_description text,
  p_tags text[]
)
returns tsvector
language sql
stable
parallel safe
set search_path = public
as $$
  select
    setweight(to_tsvector('english', coalesce(p_title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(p_short_description, '')), 'B')
    || setweight(to_tsvector('english', coalesce(p_full_description, '')), 'C')
    || setweight(to_tsvector('english', coalesce(array_to_string(p_tags, ' '), '')), 'B');
$$;

create or replace function public.trg_resources_set_search_vector()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.search_vector := public.resources_build_search_vector(
    new.title,
    new.short_description,
    new.full_description,
    new.tags
  );
  return new;
end;
$$;

drop trigger if exists resources_set_search_vector on public.resources;
create trigger resources_set_search_vector
  before insert or update of title, short_description, full_description, tags
  on public.resources
  for each row execute function public.trg_resources_set_search_vector();

create index if not exists resources_status_published_idx
  on public.resources (status, published_at desc nulls last)
  where status = 'published';

create index if not exists resources_featured_status_idx
  on public.resources (featured desc, published_at desc nulls last)
  where status = 'published' and featured = true;

create index if not exists resources_category_status_idx
  on public.resources (category_id, status, published_at desc);

create index if not exists resources_creator_idx on public.resources (creator_id);

create index if not exists resources_pricing_status_idx
  on public.resources (pricing_type, status);

create index if not exists resources_tags_gin_idx on public.resources using gin (tags);

create index if not exists resources_search_vector_idx on public.resources using gin (search_vector);

create index if not exists resources_title_trgm_idx on public.resources using gin (title gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Downloadable files (private storage metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.resource_files (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_size bigint check (file_size is null or file_size >= 0),
  file_type text,
  storage_bucket text not null default 'resource-files',
  version integer not null default 1 check (version >= 1),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint resource_files_path_unique unique (storage_bucket, file_path)
);

create index if not exists resource_files_resource_idx
  on public.resource_files (resource_id, version desc);

create unique index if not exists resource_files_one_primary_uidx
  on public.resource_files (resource_id)
  where is_primary = true;

-- ---------------------------------------------------------------------------
-- Purchases
-- ---------------------------------------------------------------------------
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  buyer_email text,
  resource_id uuid not null references public.resources (id) on delete restrict,
  amount_paid numeric(10, 2) not null default 0 check (amount_paid >= 0),
  currency char(3) not null default 'USD',
  payment_provider text,
  payment_status public.payment_status not null default 'pending',
  transaction_id text,
  metadata jsonb not null default '{}'::jsonb,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchases_currency_format check (currency ~ '^[A-Z]{3}$'),
  constraint purchases_buyer_present check (user_id is not null or buyer_email is not null)
);

create index if not exists purchases_user_created_idx
  on public.purchases (user_id, created_at desc)
  where user_id is not null;

create index if not exists purchases_resource_status_idx
  on public.purchases (resource_id, payment_status);

create unique index if not exists purchases_user_resource_completed_uidx
  on public.purchases (user_id, resource_id)
  where payment_status = 'completed' and user_id is not null;

create unique index if not exists purchases_transaction_id_uidx
  on public.purchases (transaction_id)
  where transaction_id is not null;

-- ---------------------------------------------------------------------------
-- Downloads (audit + rate limits)
-- ---------------------------------------------------------------------------
create table if not exists public.downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  resource_id uuid not null references public.resources (id) on delete cascade,
  purchase_id uuid references public.purchases (id) on delete set null,
  resource_file_id uuid references public.resource_files (id) on delete set null,
  downloaded_at timestamptz not null default now(),
  ip_address inet,
  user_agent text,
  session_id text
);

create index if not exists downloads_user_resource_time_idx
  on public.downloads (user_id, resource_id, downloaded_at desc);

create index if not exists downloads_resource_time_idx
  on public.downloads (resource_id, downloaded_at desc);

create index if not exists downloads_ip_resource_day_idx
  on public.downloads (ip_address, resource_id, downloaded_at desc);

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  review_text text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_one_per_user unique (user_id, resource_id)
);

create index if not exists reviews_resource_approved_idx
  on public.reviews (resource_id, approved, created_at desc);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  resource_id uuid not null references public.resources (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_unique unique (user_id, resource_id)
);

create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Newsletter
-- ---------------------------------------------------------------------------
create table if not exists public.newsletters (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  source text default 'resources_page',
  constraint newsletters_email_format check (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  constraint newsletters_email_unique unique (email)
);

create index if not exists newsletters_active_idx
  on public.newsletters (subscribed_at desc)
  where unsubscribed_at is null;

-- ---------------------------------------------------------------------------
-- Analytics events (views, impressions — optional granular tracking)
-- ---------------------------------------------------------------------------
create table if not exists public.resource_events (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources (id) on delete cascade,
  event_type text not null check (event_type in ('view', 'impression', 'checkout_started')),
  user_id uuid references public.profiles (id) on delete set null,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists resource_events_resource_type_time_idx
  on public.resource_events (resource_id, event_type, created_at desc);

create index if not exists resource_events_created_at_idx
  on public.resource_events (created_at desc);

-- ---------------------------------------------------------------------------
-- Helper functions (security)
-- ---------------------------------------------------------------------------
create or replace function public.is_marketplace_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_marketplace_creator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'creator')
  );
$$;

create or replace function public.owns_resource(p_resource_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.resources r
    where r.id = p_resource_id and r.creator_id = auth.uid()
  );
$$;

create or replace function public.user_has_completed_purchase(p_resource_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.purchases pu
    where pu.resource_id = p_resource_id
      and pu.user_id = p_user_id
      and pu.payment_status = 'completed'
  );
$$;

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

  if v_resource.pricing_type = 'free' then
    return true;
  end if;

  if p_user_id is null then
    return false;
  end if;

  if public.is_marketplace_admin() then
    return true;
  end if;

  return public.user_has_completed_purchase(p_resource_id, p_user_id);
end;
$$;

create or replace function public.user_within_download_limit(p_resource_id uuid, p_user_id uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_max integer;
  v_count integer;
begin
  select max_downloads_per_day into v_max from public.resources where id = p_resource_id;
  if v_max is null then
    return false;
  end if;

  select count(*)::integer into v_count
  from public.downloads d
  where d.resource_id = p_resource_id
    and (
      (p_user_id is not null and d.user_id = p_user_id)
      or (p_user_id is null and d.user_id is null and d.session_id is not null)
    )
    and d.downloaded_at > now() - interval '24 hours';

  return v_count < v_max;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rating aggregate refresh
-- ---------------------------------------------------------------------------
create or replace function public.refresh_resource_rating(p_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.resources r
  set
    rating_average = coalesce((
      select round(avg(rv.rating)::numeric, 2)
      from public.reviews rv
      where rv.resource_id = p_resource_id and rv.approved = true
    ), 0),
    rating_count = (
      select count(*)::integer
      from public.reviews rv
      where rv.resource_id = p_resource_id and rv.approved = true
    )
  where r.id = p_resource_id;
end;
$$;

create or replace function public.trg_reviews_refresh_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_resource_rating(coalesce(new.resource_id, old.resource_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.trg_reviews_refresh_rating();

-- ---------------------------------------------------------------------------
-- Download count increment
-- ---------------------------------------------------------------------------
create or replace function public.trg_downloads_increment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.resources
  set download_count = download_count + 1
  where id = new.resource_id;
  return new;
end;
$$;

drop trigger if exists downloads_increment_count on public.downloads;
create trigger downloads_increment_count
  after insert on public.downloads
  for each row execute function public.trg_downloads_increment_count();

-- ---------------------------------------------------------------------------
-- View count via events
-- ---------------------------------------------------------------------------
create or replace function public.trg_resource_events_increment_views()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.event_type = 'view' then
    update public.resources set view_count = view_count + 1 where id = new.resource_id;
  end if;
  return new;
end;
$$;

drop trigger if exists resource_events_increment_views on public.resource_events;
create trigger resource_events_increment_views
  after insert on public.resource_events
  for each row execute function public.trg_resource_events_increment_views();

-- ---------------------------------------------------------------------------
-- Auto published_at
-- ---------------------------------------------------------------------------
create or replace function public.trg_resources_set_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  if new.status <> 'published' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists resources_set_published_at on public.resources;
create trigger resources_set_published_at
  before insert or update on public.resources
  for each row execute function public.trg_resources_set_published_at();

-- ---------------------------------------------------------------------------
-- Purchase completed timestamp
-- ---------------------------------------------------------------------------
create or replace function public.trg_purchases_set_purchased_at()
returns trigger
language plpgsql
as $$
begin
  if new.payment_status = 'completed' and new.purchased_at is null then
    new.purchased_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists purchases_set_purchased_at on public.purchases;
create trigger purchases_set_purchased_at
  before insert or update on public.purchases
  for each row execute function public.trg_purchases_set_purchased_at();

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at
  before update on public.resources
  for each row execute function public.set_updated_at();

drop trigger if exists purchases_set_updated_at on public.purchases;
create trigger purchases_set_updated_at
  before update on public.purchases
  for each row execute function public.set_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth: auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.profile_role := 'customer';
  v_admin_emails text;
begin
  select value into v_admin_emails
  from public.site_settings
  where key = 'marketplace_admin_emails';

  if v_admin_emails is not null and new.email = any (
    select trim(both from unnest(string_to_array(v_admin_emails, ',')))
  ) then
    v_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    v_role
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPC: record view
-- ---------------------------------------------------------------------------
create or replace function public.record_resource_view(
  p_resource_id uuid,
  p_session_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.resources where id = p_resource_id and status = 'published'
  ) then
    return;
  end if;

  insert into public.resource_events (resource_id, event_type, user_id, session_id)
  values (p_resource_id, 'view', auth.uid(), p_session_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: record download (validates access + limits)
-- ---------------------------------------------------------------------------
create or replace function public.record_resource_download(
  p_resource_id uuid,
  p_resource_file_id uuid default null,
  p_session_id text default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_download_id uuid;
  v_purchase_id uuid;
begin
  if not public.user_can_access_resource(p_resource_id, auth.uid()) then
    raise exception 'access_denied' using errcode = '42501';
  end if;

  if not public.user_within_download_limit(p_resource_id, auth.uid()) then
    raise exception 'download_limit_exceeded' using errcode = 'P0001';
  end if;

  if auth.uid() is not null then
    select id into v_purchase_id
    from public.purchases
    where resource_id = p_resource_id
      and user_id = auth.uid()
      and payment_status = 'completed'
    order by purchased_at desc nulls last
    limit 1;
  end if;

  insert into public.downloads (
    user_id,
    resource_id,
    purchase_id,
    resource_file_id,
    ip_address,
    user_agent,
    session_id
  )
  values (
    auth.uid(),
    p_resource_id,
    v_purchase_id,
    p_resource_file_id,
    p_ip_address,
    p_user_agent,
    p_session_id
  )
  returning id into v_download_id;

  return v_download_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: list downloadable files (metadata only — sign URLs via Edge Function)
-- ---------------------------------------------------------------------------
create or replace function public.get_downloadable_files(p_resource_id uuid)
returns table (
  file_id uuid,
  file_name text,
  file_path text,
  storage_bucket text,
  file_type text,
  file_size bigint,
  version integer
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.user_can_access_resource(p_resource_id, auth.uid()) then
    raise exception 'access_denied' using errcode = '42501';
  end if;

  return query
  select
    rf.id,
    rf.file_name,
    rf.file_path,
    rf.storage_bucket,
    rf.file_type,
    rf.file_size,
    rf.version
  from public.resource_files rf
  where rf.resource_id = p_resource_id
  order by rf.is_primary desc, rf.version desc, rf.created_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: create pending purchase
-- ---------------------------------------------------------------------------
create or replace function public.create_resource_purchase(
  p_resource_id uuid,
  p_payment_provider text default 'stripe',
  p_transaction_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
-- Only path for authenticated users to create purchases (RLS has no public INSERT)
declare
  v_resource public.resources%rowtype;
  v_purchase_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select * into v_resource from public.resources where id = p_resource_id;
  if not found or v_resource.status <> 'published' then
    raise exception 'resource_not_found';
  end if;

  if v_resource.pricing_type = 'free' then
    raise exception 'resource_is_free';
  end if;

  if public.user_has_completed_purchase(p_resource_id, auth.uid()) then
    raise exception 'already_purchased';
  end if;

  insert into public.purchases (
    user_id,
    resource_id,
    amount_paid,
    currency,
    payment_provider,
    payment_status,
    transaction_id
  )
  values (
    auth.uid(),
    p_resource_id,
    v_resource.price,
    v_resource.currency,
    p_payment_provider,
    'pending',
    p_transaction_id
  )
  returning id into v_purchase_id;

  return v_purchase_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: complete purchase (webhook / admin only via service role)
-- ---------------------------------------------------------------------------
create or replace function public.complete_resource_purchase(
  p_purchase_id uuid,
  p_transaction_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.purchases
  set
    payment_status = 'completed',
    transaction_id = coalesce(p_transaction_id, transaction_id),
    purchased_at = coalesce(purchased_at, now())
  where id = p_purchase_id
    and payment_status in ('pending', 'failed');
end;
$$;

revoke execute on function public.complete_resource_purchase(uuid, text) from public;
grant execute on function public.complete_resource_purchase(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- RPC: search (pagination-ready)
-- ---------------------------------------------------------------------------
create or replace function public.search_resources(
  p_query text default null,
  p_category_slug text default null,
  p_pricing_type public.pricing_type default null,
  p_featured_only boolean default false,
  p_sort text default 'newest',
  p_limit integer default 20,
  p_offset integer default 0
)
returns setof public.resources
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tsquery tsquery;
begin
  if p_limit < 1 or p_limit > 100 then
    raise exception 'invalid_limit';
  end if;
  if p_offset < 0 then
    raise exception 'invalid_offset';
  end if;

  if p_query is not null and length(trim(p_query)) > 0 then
    v_tsquery := websearch_to_tsquery('english', trim(p_query));
  end if;

  return query
  select r.*
  from public.resources r
  left join public.resource_categories c on c.id = r.category_id
  where r.status = 'published'
    and (p_category_slug is null or c.slug = p_category_slug)
    and (p_pricing_type is null or r.pricing_type = p_pricing_type)
    and (not p_featured_only or r.featured = true)
    and (
      v_tsquery is null
      or r.search_vector @@ v_tsquery
      or r.title ilike '%' || trim(p_query) || '%'
    )
  order by
    case when p_sort = 'trending' then r.view_count end desc nulls last,
    case when p_sort = 'downloads' then r.download_count end desc nulls last,
    case when p_sort = 'rating' then r.rating_average end desc nulls last,
    case when p_sort = 'price_asc' then r.price end asc nulls last,
    case when p_sort = 'price_desc' then r.price end desc nulls last,
    r.published_at desc nulls last,
    r.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- ---------------------------------------------------------------------------
-- RPC: trending & related
-- ---------------------------------------------------------------------------
create or replace function public.get_trending_resources(
  p_days integer default 14,
  p_limit integer default 8
)
returns setof public.resources
language sql
stable
security definer
set search_path = public
as $$
  select r.*
  from public.resources r
  where r.status = 'published'
  order by (
    select count(*) from public.resource_events e
    where e.resource_id = r.id
      and e.event_type = 'view'
      and e.created_at > now() - make_interval(days => greatest(p_days, 1))
  ) desc, r.download_count desc
  limit least(greatest(p_limit, 1), 50);
$$;

create or replace function public.get_related_resources(
  p_resource_id uuid,
  p_limit integer default 4
)
returns setof public.resources
language sql
stable
security definer
set search_path = public
as $$
  select r2.*
  from public.resources r
  join public.resources r2 on r2.category_id = r.category_id and r2.id <> r.id
  where r.id = p_resource_id
    and r2.status = 'published'
  order by r2.rating_average desc, r2.download_count desc
  limit least(greatest(p_limit, 1), 20);
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.resource_categories enable row level security;
alter table public.resources enable row level security;
alter table public.resource_files enable row level security;
alter table public.purchases enable row level security;
alter table public.downloads enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.newsletters enable row level security;
alter table public.resource_events enable row level security;

-- profiles
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read"
  on public.profiles for select to anon, authenticated
  using (true);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
  on public.profiles for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

-- resource_categories
drop policy if exists "resource_categories_public_read" on public.resource_categories;
create policy "resource_categories_public_read"
  on public.resource_categories for select to anon, authenticated
  using (true);

drop policy if exists "resource_categories_admin_write" on public.resource_categories;
create policy "resource_categories_admin_write"
  on public.resource_categories for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

-- resources
drop policy if exists "resources_public_read_published" on public.resources;
create policy "resources_public_read_published"
  on public.resources for select to anon, authenticated
  using (status = 'published');

drop policy if exists "resources_creator_read_own" on public.resources;
create policy "resources_creator_read_own"
  on public.resources for select to authenticated
  using (creator_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists "resources_creator_insert" on public.resources;
create policy "resources_creator_insert"
  on public.resources for insert to authenticated
  with check (
    public.is_marketplace_creator()
    and (creator_id = auth.uid() or public.is_marketplace_admin())
  );

drop policy if exists "resources_creator_update" on public.resources;
create policy "resources_creator_update"
  on public.resources for update to authenticated
  using (public.owns_resource(id) or public.is_marketplace_admin())
  with check (public.owns_resource(id) or public.is_marketplace_admin());

drop policy if exists "resources_admin_delete" on public.resources;
create policy "resources_admin_delete"
  on public.resources for delete to authenticated
  using (public.is_marketplace_admin());

-- resource_files (no public direct access to paths)
drop policy if exists "resource_files_creator_admin" on public.resource_files;
create policy "resource_files_creator_admin"
  on public.resource_files for all to authenticated
  using (
    public.is_marketplace_admin()
    or public.owns_resource(resource_id)
  )
  with check (
    public.is_marketplace_admin()
    or public.owns_resource(resource_id)
  );

-- purchases
drop policy if exists "purchases_self_read" on public.purchases;
create policy "purchases_self_read"
  on public.purchases for select to authenticated
  using (user_id = auth.uid() or public.is_marketplace_admin());

-- purchases: created via create_resource_purchase() (security definer) or service role webhook

drop policy if exists "purchases_admin_all" on public.purchases;
create policy "purchases_admin_all"
  on public.purchases for all to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

-- downloads
drop policy if exists "downloads_self_read" on public.downloads;
create policy "downloads_self_read"
  on public.downloads for select to authenticated
  using (user_id = auth.uid() or public.is_marketplace_admin());

-- downloads: inserts only via record_resource_download() (security definer)

-- reviews
drop policy if exists "reviews_public_read_approved" on public.reviews;
create policy "reviews_public_read_approved"
  on public.reviews for select to anon, authenticated
  using (approved = true or user_id = auth.uid() or public.is_marketplace_admin());

drop policy if exists "reviews_auth_insert" on public.reviews;
create policy "reviews_auth_insert"
  on public.reviews for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.user_can_access_resource(resource_id, auth.uid())
  );

drop policy if exists "reviews_self_update" on public.reviews;
create policy "reviews_self_update"
  on public.reviews for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid() and approved = false);

drop policy if exists "reviews_admin_moderate" on public.reviews;
create policy "reviews_admin_moderate"
  on public.reviews for update to authenticated
  using (public.is_marketplace_admin())
  with check (public.is_marketplace_admin());

-- favorites
drop policy if exists "favorites_self_all" on public.favorites;
create policy "favorites_self_all"
  on public.favorites for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- newsletters
drop policy if exists "newsletters_public_insert" on public.newsletters;
create policy "newsletters_public_insert"
  on public.newsletters for insert to anon, authenticated
  with check (true);

drop policy if exists "newsletters_admin_read" on public.newsletters;
create policy "newsletters_admin_read"
  on public.newsletters for select to authenticated
  using (public.is_marketplace_admin());

-- resource_events
drop policy if exists "resource_events_public_insert" on public.resource_events;
create policy "resource_events_public_insert"
  on public.resource_events for insert to anon, authenticated
  with check (true);

drop policy if exists "resource_events_admin_read" on public.resource_events;
create policy "resource_events_admin_read"
  on public.resource_events for select to authenticated
  using (public.is_marketplace_admin());

-- ---------------------------------------------------------------------------
-- Grants for RPC
-- ---------------------------------------------------------------------------
grant execute on function public.is_marketplace_admin() to anon, authenticated;
grant execute on function public.is_marketplace_creator() to anon, authenticated;
grant execute on function public.user_can_access_resource(uuid, uuid) to anon, authenticated;
grant execute on function public.record_resource_view(uuid, text) to anon, authenticated;
grant execute on function public.record_resource_download(uuid, uuid, text, inet, text) to anon, authenticated;
grant execute on function public.get_downloadable_files(uuid) to anon, authenticated;
grant execute on function public.create_resource_purchase(uuid, text, text) to authenticated;
grant execute on function public.search_resources(text, text, public.pricing_type, boolean, text, integer, integer) to anon, authenticated;
grant execute on function public.get_trending_resources(integer, integer) to anon, authenticated;
grant execute on function public.get_related_resources(uuid, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin settings key for bootstrap admins
-- ---------------------------------------------------------------------------
insert into public.site_settings (key, value)
values ('marketplace_admin_emails', '')
on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- Public views for storefront (optional thin layer)
-- ---------------------------------------------------------------------------
create or replace view public.published_resources
with (security_invoker = true)
as
select
  r.id,
  r.slug,
  r.title,
  r.short_description,
  r.thumbnail_url,
  r.preview_images,
  r.preview_video_url,
  r.category_id,
  r.creator_id,
  r.pricing_type,
  r.price,
  r.compare_at_price,
  r.currency,
  r.featured,
  r.file_formats,
  r.compatibility,
  r.license_type,
  r.tags,
  r.download_count,
  r.view_count,
  r.rating_average,
  r.rating_count,
  r.seo_title,
  r.seo_description,
  r.published_at,
  r.created_at
from public.resources r
where r.status = 'published';

grant select on public.published_resources to anon, authenticated;
