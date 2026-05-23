# Resources Marketplace — API Examples

Uses `@supabase/supabase-js` via `src/lib/resources/api.js`.

## Setup

```js
import {
  fetchResources,
  fetchFeaturedResources,
  fetchResourceBySlug,
  createPurchase,
  downloadResourceFile,
  createReview,
  toggleFavorite,
  subscribeNewsletter,
  signInWithGoogle,
} from '../lib/resources/api';
import { supabase } from '../lib/supabase';
```

---

## Fetch published resources (paginated)

```js
const { data, error } = await fetchResources({
  categorySlug: 'ui-kits',
  sort: 'downloads',
  limit: 9,
  offset: 0,
});
```

Direct RPC:

```js
const { data, error } = await supabase.rpc('search_resources', {
  p_query: 'figma',
  p_category_slug: null,
  p_pricing_type: 'free',
  p_featured_only: false,
  p_sort: 'rating',
  p_limit: 20,
  p_offset: 0,
});
```

---

## Featured resources

```js
const { data: featured, error } = await fetchFeaturedResources(6);
```

---

## Single resource by slug (with category)

```js
const { data: resource, error } = await fetchResourceBySlug('cinematic-ui-kit');
```

---

## Record a view (analytics)

```js
await supabase.rpc('record_resource_view', {
  p_resource_id: resource.id,
  p_session_id: crypto.randomUUID(),
});
```

---

## Free download flow

```js
const { data, error } = await downloadResourceFile(resourceId);
if (data?.signedUrl) {
  window.location.href = data.signedUrl;
}
```

Step-by-step:

```js
// 1. Validate + log
const { data: downloadId, error: logErr } = await supabase.rpc('record_resource_download', {
  p_resource_id: resourceId,
  p_resource_file_id: fileId,
});

// 2. Get paths
const { data: files } = await supabase.rpc('get_downloadable_files', {
  p_resource_id: resourceId,
});

// 3. Sign URL (2 min TTL)
const { data: signed } = await supabase.storage
  .from(files[0].storage_bucket)
  .createSignedUrl(files[0].file_path, 120);
```

---

## Paid purchase flow

```js
// Client: create pending purchase
const { data: purchaseId, error } = await createPurchase(resourceId, 'stripe');

// Redirect to Stripe Checkout with purchaseId in metadata…

// Server (Edge Function, service role):
import { createClient } from '@supabase/supabase-js';
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
await admin.rpc('complete_resource_purchase', {
  p_purchase_id: purchaseId,
  p_transaction_id: stripeSessionId,
});
```

Check access:

```js
const { data: allowed } = await supabase.rpc('user_can_access_resource', {
  p_resource_id: resourceId,
});
```

---

## User library (purchases)

```js
import { fetchUserPurchases } from '../lib/resources/api';

const { data: library } = await fetchUserPurchases();
```

---

## Review

```js
const { error } = await createReview(resourceId, 5, 'Saved our team two weeks.');
```

Admin approve (SQL or admin UI):

```sql
update public.reviews set approved = true where id = '…';
```

---

## Favorite / wishlist

```js
await toggleFavorite(resourceId);

const { data: favorites } = await fetchUserFavorites();
```

---

## Newsletter

```js
await subscribeNewsletter('you@studio.com', 'resources_page');
```

---

## Auth — Google

```js
await signInWithGoogle();
```

Email/password (existing helper):

```js
import { signIn } from '../lib/supabase';
await signIn('admin@example.com', 'password');
```

---

## Creator dashboard

```js
import { fetchCreatorDashboard } from '../lib/resources/api';

const { data } = await fetchCreatorDashboard();
// data.resources, data.purchases, data.reviews
```

---

## Trending & related

```js
const { data: trending } = await supabase.rpc('get_trending_resources', {
  p_days: 14,
  p_limit: 8,
});

const { data: related } = await supabase.rpc('get_related_resources', {
  p_resource_id: resourceId,
  p_limit: 4,
});
```

---

## Edge cases

| Case | Behavior |
|------|----------|
| Download over daily limit | RPC raises `download_limit_exceeded` |
| Purchase free resource | RPC raises `resource_is_free` |
| Duplicate purchase | Unique index + RPC `already_purchased` |
| Review without access | RLS insert denied |
| Unpublished resource | Not in search; access denied |
| Missing Supabase env | Helpers return configured error |
