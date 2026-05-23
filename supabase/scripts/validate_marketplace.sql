-- Marketplace schema validation (run: supabase db query --file supabase/scripts/validate_marketplace.sql --linked)

select 'profiles' as tbl, count(*)::int as rows from public.profiles
union all select 'resource_categories', count(*)::int from public.resource_categories
union all select 'resources', count(*)::int from public.resources
union all select 'resource_files', count(*)::int from public.resource_files
union all select 'purchases', count(*)::int from public.purchases
union all select 'downloads', count(*)::int from public.downloads
union all select 'reviews', count(*)::int from public.reviews
union all select 'favorites', count(*)::int from public.favorites
union all select 'newsletters', count(*)::int from public.newsletters;

select slug, status, pricing_type, featured from public.resources order by created_at desc limit 10;

select id, name, public from storage.buckets
where id in ('resource-files', 'resource-previews', 'user-avatars');
