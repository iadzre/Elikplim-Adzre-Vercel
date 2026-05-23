/**
 * Resources Marketplace — Supabase client helpers
 * @see docs/resources-marketplace-architecture.md
 * @see docs/resources-api-examples.md
 */

import { supabase, isSupabaseConfigured } from '../supabase';

const PUBLISHED_RESOURCE_COLUMNS = `
  id, slug, title, short_description, full_description,
  thumbnail_url, preview_images, preview_video_url,
  category_id, creator_id, pricing_type, price, compare_at_price, currency,
  featured, file_formats, compatibility, license_type, tags,
  download_count, view_count, rating_average, rating_count,
  seo_title, seo_description, published_at, created_at
`;

/**
 * @param {import('../../types/marketplace.database').ResourceSearchParams} [params]
 */
export async function fetchResources(params = {}) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  const {
    query = null,
    categorySlug = null,
    pricingType = null,
    featuredOnly = false,
    sort = 'newest',
    limit = 20,
    offset = 0,
  } = params;

  return supabase.rpc('search_resources', {
    p_query: query,
    p_category_slug: categorySlug,
    p_pricing_type: pricingType,
    p_featured_only: featuredOnly,
    p_sort: sort,
    p_limit: limit,
    p_offset: offset,
  });
}

export async function fetchFeaturedResources(limit = 6) {
  return fetchResources({ featuredOnly: true, sort: 'downloads', limit });
}

export async function fetchResourceBySlug(slug) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase
    .from('resources')
    .select(`${PUBLISHED_RESOURCE_COLUMNS}, resource_categories(name, slug, icon)`)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
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

export async function fetchTrendingResources(days = 14, limit = 8) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  return supabase.rpc('get_trending_resources', { p_days: days, p_limit: limit });
}

export async function fetchRelatedResources(resourceId, limit = 4) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  return supabase.rpc('get_related_resources', { p_resource_id: resourceId, p_limit: limit });
}

/**
 * @param {string} resourceId
 * @param {string} [sessionId]
 */
export async function recordResourceView(resourceId, sessionId = null) {
  if (!isSupabaseConfigured()) return { error: new Error('Supabase is not configured') };
  return supabase.rpc('record_resource_view', {
    p_resource_id: resourceId,
    p_session_id: sessionId,
  });
}

/**
 * @param {string} resourceId
 */
export async function createPurchase(resourceId, paymentProvider = 'stripe', transactionId = null) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase.rpc('create_resource_purchase', {
    p_resource_id: resourceId,
    p_payment_provider: paymentProvider,
    p_transaction_id: transactionId,
  });
}

/**
 * Validates access, enforces rate limits, logs download.
 * @param {string} resourceId
 * @param {string} [resourceFileId]
 */
export async function recordDownload(resourceId, resourceFileId = null, sessionId = null) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase.rpc('record_resource_download', {
    p_resource_id: resourceId,
    p_resource_file_id: resourceFileId,
    p_session_id: sessionId,
  });
}

/**
 * Returns file metadata — use createSignedDownloadUrl for actual bytes.
 * @param {string} resourceId
 */
export async function getDownloadableFiles(resourceId) {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  return supabase.rpc('get_downloadable_files', { p_resource_id: resourceId });
}

/**
 * @param {string} bucket
 * @param {string} path
 * @param {number} [expiresIn]
 */
export async function createSignedDownloadUrl(bucket, path, expiresIn = 120) {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

/**
 * Full download flow: log + signed URL for primary file.
 * @param {string} resourceId
 */
export async function downloadResourceFile(resourceId) {
  const filesResult = await getDownloadableFiles(resourceId);
  if (filesResult.error) return filesResult;

  const files = filesResult.data ?? [];
  if (!files.length) {
    return { data: null, error: new Error('No files available') };
  }

  const file = files[0];
  const logResult = await recordDownload(resourceId, file.file_id);
  if (logResult.error) return logResult;

  const signed = await createSignedDownloadUrl(file.storage_bucket, file.file_path);
  return { data: { file, signedUrl: signed.data?.signedUrl }, error: signed.error };
}

/**
 * @param {string} resourceId
 * @param {number} rating
 * @param {string} [reviewText]
 */
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
    return supabase.from('favorites').delete().eq('id', existing.data.id);
  }

  return supabase.from('favorites').insert({ user_id: user.id, resource_id: resourceId });
}

export async function fetchUserFavorites() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Sign in required') };

  return supabase
    .from('favorites')
    .select(`created_at, resources(${PUBLISHED_RESOURCE_COLUMNS})`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
}

export async function fetchUserPurchases() {
  if (!isSupabaseConfigured()) {
    return { data: [], error: new Error('Supabase is not configured') };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: new Error('Sign in required') };

  return supabase
    .from('purchases')
    .select(`*, resources(${PUBLISHED_RESOURCE_COLUMNS})`)
    .eq('user_id', user.id)
    .eq('payment_status', 'completed')
    .order('purchased_at', { ascending: false });
}

export async function subscribeNewsletter(email, source = 'resources_page') {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase.from('newsletters').insert({ email, source });
}

export async function fetchCreatorDashboard() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Sign in required') };

  const [resources, purchases, reviews] = await Promise.all([
    supabase
      .from('resources')
      .select('id, title, slug, status, pricing_type, price, download_count, view_count, rating_average')
      .eq('creator_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('purchases')
      .select('amount_paid, currency, payment_status, purchased_at, resources(title, slug)')
      .eq('payment_status', 'completed')
      .in(
        'resource_id',
        (
          await supabase.from('resources').select('id').eq('creator_id', user.id)
        ).data?.map((r) => r.id) ?? []
      ),
    supabase
      .from('reviews')
      .select('rating, approved, created_at, resources(title)')
      .in(
        'resource_id',
        (
          await supabase.from('resources').select('id').eq('creator_id', user.id)
        ).data?.map((r) => r.id) ?? []
      )
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return {
    data: {
      resources: resources.data ?? [],
      purchases: purchases.data ?? [],
      reviews: reviews.data ?? [],
    },
    error: resources.error || purchases.error || reviews.error,
  };
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/resources` },
  });
}

export async function getCurrentProfile() {
  if (!isSupabaseConfigured()) {
    return { data: null, error: new Error('Supabase is not configured') };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: null };

  return supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
}
