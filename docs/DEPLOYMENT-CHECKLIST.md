# Resources Marketplace — deployment checklist

## 1. Supabase

```bash
npm run supabase:db-push
npm run supabase:seed-resources
supabase db query --file supabase/scripts/validate_marketplace.sql --linked
```

Migrations applied: `006`–`010` (nav, marketplace, storage, CMS admin, Stripe).

## 2. Environment variables

### Vercel (Production + Preview)

| Variable | Where |
|----------|--------|
| `VITE_SUPABASE_URL` | Build + browser |
| `VITE_SUPABASE_ANON_KEY` | Build + browser |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Build + browser |
| `VITE_SITE_URL` | Checkout redirect URLs |
| `SUPABASE_SERVICE_ROLE_KEY` | API routes only |
| `STRIPE_SECRET_KEY` | API routes only |
| `STRIPE_WEBHOOK_SECRET` | `api/stripe-webhook` |

Copy from `.env.example`.

## 3. Stripe

1. Create product/prices optional — Checkout uses dynamic `price_data`.
2. Webhook endpoint: `https://YOUR_DOMAIN/api/stripe-webhook`
3. Events: `checkout.session.completed`, `checkout.session.expired`
4. Use test keys until verified, then live keys.

## 4. Supabase Auth

- Enable Email + Google providers
- Add site URL and redirect URLs: `https://YOUR_DOMAIN/resources`
- Set `site_settings.marketplace_admin_emails` for auto-admin profiles (optional)

## 5. Storage

Buckets (migration `008`):

- `resource-previews` — public thumbnails
- `resource-files` — private downloads (`{resource_id}/1/{filename}`)
- `user-avatars` — public

Upload files via **Admin → Shop → Edit resource → Download files**.

## 6. Vercel deploy

```bash
npm run build
git push origin main
```

API routes: `/api/create-checkout-session`, `/api/stripe-webhook`.

## 7. Post-deploy smoke test

- [ ] `/resources` loads published products from Supabase
- [ ] Category filter + search + pagination
- [ ] Free resource download (signed URL)
- [ ] Paid checkout (Stripe test card `4242…`)
- [ ] Webhook completes purchase → library access
- [ ] Admin `/admin/shop/resources` CRUD
- [ ] Review submit + admin approve

## 8. File structure

```
api/
  create-checkout-session.js
  stripe-webhook.js
  _lib/supabaseAdmin.js
src/
  lib/services/resourcesService.js
  features/resources/hooks/
  pages/ResourcesPage.jsx
  pages/ResourceDetailPage.jsx
  components/resources/
supabase/migrations/007-010*.sql
```
