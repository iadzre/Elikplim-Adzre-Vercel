# Media storage migration

Move portfolio files from Git LFS (`public/images/`) to **Supabase Storage** with WebP compression for images.

## Prerequisites

1. Local media: `public/images/` present (~897MB). If missing: `npm run media:pull` (requires GitHub LFS quota).
2. Supabase linked: `supabase link --project-ref <ref>`
3. **Service role key** in `.env.local` (Dashboard → Settings → API → `service_role`):

   ```env
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   Or use a linked Supabase CLI session (script auto-fetches the key).

4. Apply bucket limit migration (for videos up to ~200MB):

   ```bash
   npm run supabase:db-push
   ```

## Run migration

```bash
# Preview (no uploads)
npm run media:migrate -- --dry-run

# Upload slider only (good first test)
npm run media:migrate -- --only slider

# Full upload + compress all 140 files
npm run media:migrate

# Update CMS database paths (/images/… → Supabase URLs)
npm run supabase:media-urls
```

## What the script does

| Step | Action |
|------|--------|
| Scan | All files under `public/images/` |
| Compress | Images → WebP (hero 1920px, covers 1400px, gallery 1920px) |
| Upload | `hero-backgrounds`, `project-covers`, `project-gallery` under `legacy/` prefix |
| Videos | Uploaded as-is to `project-gallery` |
| Output | `supabase/generated/media-url-map.json`, `update-media-urls.sql`, `src/constants/storageMediaUrls.js` |

## Buckets

| Local path | Bucket |
|------------|--------|
| `slider/*` | `hero-backgrounds` |
| `PrjXX/cover.jpg` (etc.) | `project-covers` |
| Everything else | `project-gallery` |

## After migration

1. Redeploy Vercel (no LFS images required for production).
2. Verify home slider, projects, and gallery on the live site.
3. Optional: remove `public/images` from Git LFS in a future cleanup PR.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Missing Supabase admin credentials` | Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` |
| `Payload too large` / `exceeded the maximum allowed size` | Supabase free tier caps uploads at **50MB**. Host larger videos on YouTube/Vimeo and set the gallery item URL in Admin, or upgrade Supabase Pro |
| `Gateway Timeout` on upload | Re-run for that file: `npm run media:migrate -- --only "Prj02/foo.jpg"` then **`npm run media:migrate`** (full) to restore the complete URL map |
| Images still show `/images/…` | Run `npm run supabase:media-urls` |

### Videos not migrated (manual follow-up)

After the initial run, check `supabase/generated/upload-failures.txt`. Typical failures:

- `Prj13/Director_2.mp4` (~156MB)
- `Prj13/iWorship The Look Back.mp4` (~66MB)

These stay on `/images/…` until hosted elsewhere or Supabase Pro allows larger uploads.

See also: [MEDIA-LFS-BUDGET.md](./MEDIA-LFS-BUDGET.md)
