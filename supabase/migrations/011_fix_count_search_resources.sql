-- Fix count_search_resources: was calling search_resources(limit 10000) which raises invalid_limit

create or replace function public.count_search_resources(
  p_query text default null,
  p_category_slug text default null,
  p_pricing_type public.pricing_type default null,
  p_featured_only boolean default false
)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tsquery tsquery;
  v_count bigint;
begin
  if p_query is not null and length(trim(p_query)) > 0 then
    v_tsquery := websearch_to_tsquery('english', trim(p_query));
  end if;

  select count(*)::bigint into v_count
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
    );

  return coalesce(v_count, 0);
end;
$$;

grant execute on function public.count_search_resources(text, text, public.pricing_type, boolean) to anon, authenticated;
