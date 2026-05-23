/**
 * Resources marketplace — Supabase service layer (no mock data).
 */

import { supabase, isSupabaseConfigured } from '../supabase';
import { mapDbResourceToCatalog } from '../resources/mapResource';
import { ALL_DOWNLOADS_FREE } from '../resources/marketplaceConfig';

export const PAGE_SIZE = 9;

const PUBLISHED_COLUMNS = `
  id, slug, title, short_description, full_description,
  thumbnail_url, preview_images, preview_video_url,
  category_id, creator_id, pricing_type, price, compare_at_price, currency,
  featured, file_formats, compatibility, license_type, tags,
  download_count, view_count, rating_average, rating_count,
  seo_title, seo_description, published_at, created_at,
  resource_categories ( id, name, slug, icon )
`;

/** @param {import('../../types/marketplace.database').ResourceSort} sort */
function mapSortToRpc(sort) {
  const map = {
    featured: 'newest',
    newest: 'newest',
    downloads: 'downloads',
    rating: 'rating',
    'price-asc': 'price_asc',
    'price-desc': 'price_desc',
    trending: 'trending',
  };
  return map[sort] ?? 'newest';
}

/** @param {'all' | 'free' | 'paid'} tier */
function mapTierToPricingType(tier) {
  if (tier === 'free') return 'free';
  if (tier === 'paid') return 'paid';
  return null;
}

/**
 * @param {Object} params
 * @param {string} [params.query]
 * @param {string} [params.categorySlug]
 * @param {'all'|'free'|'paid'} [params.tierFilter]
 * @param {boolean} [params.featuredOnly]
 * @param {import('../../types/marketplace.database').ResourceSort} [params.sort]
 * @param {number} [params.page]
 * @param {number} [params.pageSize]
 */
export async function searchPublishedResources({
  query = '',
  categorySlug = null,
  tierFilter = 'all',
  featuredOnly = false,
  sort = 'featured',
  page = 1,
  pageSize = PAGE_SIZE,
} = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], total: 0, error: new Error('Supabase is not configured') };
  }

  const safeLimit = Math.min(100, Math.max(1, Number(pageSize) || PAGE_SIZE));
  const safePage = Math.max(1, Number(page) || 1);
  const offset = (safePage - 1) * safeLimit;
  const rpcSort = sort === 'featured' ? 'downloads' : mapSortToRpc(sort);

  const [listRes, countRes] = await Promise.all([
    supabase.rpc('search_resources', {
      p_query: query.trim() || null,
      p_category_slug: categorySlug === 'all' ? null : categorySlug,
      p_pricing_type: mapTierToPricingType(tierFilter),
      p_featured_only: featuredOnly,
      p_sort: rpcSort,
      p_limit: safeLimit,
      p_offset: offset,
    }),
    supabase.rpc('count_search_resources', {
      p_query: query.trim() || null,
      p_category_slug: categorySlug === 'all' ? null : categorySlug,
      p_pricing_type: mapTierToPricingType(tierFilter),
      p_featured_only: featuredOnly,
    }),
  ]);

  if (listRes.error) {
    return { data: [], total: 0, error: listRes.error };
  }

  const rows = listRes.data ?? [];
  const total = countRes.error ? rows.length : Number(countRes.data ?? rows.length);

  return {
    data: rows.map((row) => mapDbResourceToCatalog(row)),
    total,
    error: null,
  };
}

export async function fetchFeaturedResources(limit = 6) {
  const result = await searchPublishedResources({
    featuredOnly: true,
    sort: 'downloads',
    page: 1,
    pageSize: limit,
  });
  return { data: result.data, error: result.error };
}

export async function fetchTrendingResources(days = 14, limit = 8) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase.rpc('get_trending_resources', {
    p_days: days,
    p_limit: limit,
  });
  return {
    data: (data ?? []).map((row) => mapDbResourceToCatalog(row)),
    error,
  };
}

export async function fetchResourceBySlug(slug) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase
    .from('resources')
    .select(PUBLISHED_COLUMNS)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    return { data: null, error: error ?? new Error('Resource not found') };
  }
  return { data: mapDbResourceToCatalog(data), error: null };
}

export async function fetchCategories() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  return supabase
    .from('resource_categories')
    .select('id, name, slug, description, icon, featured, display_order')
    .order('display_order', { ascending: true });
}

export async function fetchRelatedResources(resourceId, limit = 4) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase.rpc('get_related_resources', {
    p_resource_id: resourceId,
    p_limit: limit,
  });
  return { data: (data ?? []).map((row) => mapDbResourceToCatalog(row)), error };
}

export async function fetchApprovedReviews(resourceId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  return supabase
    .from('reviews')
    .select('id, rating, review_text, created_at, profiles(full_name, username)')
    .eq('resource_id', resourceId)
    .eq('approved', true)
    .order('created_at', { ascending: false });
}

export function getSessionId() {
  const key = 'resource_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
  }
  return id;
}

export async function recordResourceView(resourceId) {
  if (!isSupabaseConfigured()) return { error: new Error('Supabase is not configured') };
  return supabase.rpc('record_resource_view', {
    p_resource_id: resourceId,
    p_session_id: getSessionId(),
  });
}

export async function checkResourceAccess(resourceId) {
  if (ALL_DOWNLOADS_FREE) {
    return { data: true, error: null };
  }
  if (!isSupabaseConfigured()) {
    return { data: false, error: new Error('Supabase is not configured') };
  }
  const { data, error } = await supabase.rpc('user_owns_resource', {
    p_resource_id: resourceId,
  });
  return { data: Boolean(data), error };
}

export async function createPendingPurchase(resourceId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: new Error('Sign in required to purchase') };
  }
  const { data, error } = await supabase.rpc('create_resource_purchase', {
    p_resource_id: resourceId,
    p_payment_provider: 'stripe',
  });
  return { data, error };
}

export async function attachStripeSession(purchaseId, stripeSessionId) {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') };
  }
  return supabase.rpc('set_purchase_stripe_session', {
    p_purchase_id: purchaseId,
    p_stripe_session_id: stripeSessionId,
  });
}

/**
 * @param {string} purchaseId
 * @param {string} resourceSlug
 */
export async function startStripeCheckout(purchaseId, resourceSlug) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    return { url: null, error: new Error('Sign in required') };
  }

  const origin = window.location.origin;
  const res = await fetch(`${origin}/api/create-checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ purchaseId, resourceSlug }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { url: null, error: new Error(body.error ?? 'Checkout failed') };
  }
  return { url: body.url, sessionId: body.sessionId, error: null };
}

export async function downloadResourceFile(resourceId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const access = await checkResourceAccess(resourceId);
  if (access.error) return { data: null, error: access.error };
  if (!access.data) {
    return { data: null, error: new Error('Purchase or sign-in required to download') };
  }

  const { data: files, error: filesError } = await supabase.rpc('get_downloadable_files', {
    p_resource_id: resourceId,
  });
  if (filesError) return { data: null, error: filesError };
  if (!files?.length) {
    return { data: null, error: new Error('No downloadable files attached to this resource') };
  }

  const file = files[0];
  const { error: logError } = await supabase.rpc('record_resource_download', {
    p_resource_id: resourceId,
    p_resource_file_id: file.file_id,
    p_session_id: getSessionId(),
  });
  if (logError) return { data: null, error: logError };

  const { data: signed, error: signError } = await supabase.storage
    .from(file.storage_bucket)
    .createSignedUrl(file.file_path, 120);

  if (signError) return { data: null, error: signError };
  return {
    data: { file, signedUrl: signed.signedUrl },
    error: null,
  };
}

export async function createReview(resourceId, rating, reviewText = '') {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Sign in required') };

  return supabase.from('reviews').insert({
    user_id: user.id,
    resource_id: resourceId,
    rating,
    review_text: reviewText || null,
  });
}

export async function fetchIsFavorited(resourceId) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: false, error: null };

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('resource_id', resourceId)
    .maybeSingle();
  return { data: Boolean(data?.id), error: null };
}

export async function toggleFavorite(resourceId) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Sign in required') };

  const existing = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('resource_id', resourceId)
    .maybeSingle();

  if (existing.data?.id) {
    const { error } = await supabase.from('favorites').delete().eq('id', existing.data.id);
    return { data: false, error };
  }
  const { error } = await supabase.from('favorites').insert({
    user_id: user.id,
    resource_id: resourceId,
  });
  return { data: true, error };
}

export async function fetchUserLibrary() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  const { data, error } = await supabase
    .from('purchases')
    .select(`resource_id, purchased_at, resources!inner(${PUBLISHED_COLUMNS})`)
    .eq('user_id', user.id)
    .eq('payment_status', 'completed');

  if (error) return { data: [], error };

  const freeAccess = await supabase
    .from('resources')
    .select(PUBLISHED_COLUMNS)
    .eq('pricing_type', 'free')
    .eq('status', 'published');

  const purchased = (data ?? [])
    .map((row) => mapDbResourceToCatalog(row.resources))
    .filter(Boolean);

  const freeItems = (freeAccess.data ?? []).map((row) => mapDbResourceToCatalog(row));
  const byId = new Map();
  [...purchased, ...freeItems].forEach((r) => byId.set(r.id, r));

  return { data: Array.from(byId.values()), error: null };
}

export async function subscribeNewsletter(email, source = 'resources_page') {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  return supabase.from('newsletters').upsert(
    { email, source, unsubscribed_at: null },
    { onConflict: 'email' }
  );
}

export async function getAuthUser() {
  if (!isSupabaseConfigured()) {
    return { user: null, session: null };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { user: session?.user ?? null, session };
}

export async function signInWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpWithEmail(email, password) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  return supabase.auth.signUp({ email, password });
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    return { error: new Error('Supabase is not configured') };
  }
  return supabase.auth.signOut();
}
