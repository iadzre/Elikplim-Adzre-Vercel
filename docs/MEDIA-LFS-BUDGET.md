
# Git LFS budget exceeded

Portfolio media under `public/images/` (~900MB, 140 files) is stored in **Git LFS**. GitHub blocks LFS downloads when the account’s **storage or bandwidth** quota is used up. You may see:

> This repository exceeded its LFS budget.

Or on Vercel:

> Error: Command "git lfs install && git lfs pull && npm install" exited with 2

## Fix Vercel deploy (do this first)

`vercel.json` on `main` already uses **`npm install` only**. If Vercel still runs the old LFS command, the **dashboard is overriding** the repo config.

1. [Vercel Dashboard](https://vercel.com) → your project → **Settings** → **Build and Deployment**
2. **Install Command** → turn **Override** **off**, or set the value to exactly: `npm install`
3. **Settings** → **Git** → disable **Git Large File Storage (LFS)**
4. Optional: **Environment Variables** → add `GIT_LFS_SKIP_SMUDGE` = `1` (all environments)
5. **Deployments** → **Redeploy** the latest commit (`5bf72c6` or newer) — not an old failed deployment

Confirm the deployment log shows `Running "install" command: npm install...` (not `git lfs`).

## Quick fixes (pick one)

### 1. Restore GitHub LFS (fastest if you can pay)

1. Open [GitHub → Settings → Billing → Plans and usage](https://github.com/settings/billing).
2. Under **Git LFS Data**, add a **data pack** or wait for the monthly bandwidth reset.
3. Locally: `npm run media:pull`
4. In **Vercel → Project → Settings → Git**, turn **Git LFS** off (see below) unless you re-enable LFS pull intentionally.

### 2. Unblock Vercel deploys (no LFS download)

This repo’s `vercel.json` uses `npm install` only (no `git lfs pull`).

Also in **Vercel → Settings → Git**:

- Disable **Git Large File Storage (LFS)** for the project, **or**
- Add environment variable `GIT_LFS_SKIP_SMUDGE` = `1`

Deploys will succeed, but **images/videos under `/images/…` will not load** until real files are hosted elsewhere or LFS is restored.

### 3. Move media off LFS (recommended long-term)

**Status:** Migration tooling is in place (`npm run media:migrate`). Most images are on Supabase Storage; see [MEDIA-STORAGE-MIGRATION.md](./MEDIA-STORAGE-MIGRATION.md).

Host files in **Supabase Storage** (buckets: `project-covers`, `project-gallery`, `hero-backgrounds`):

1. Run `npm run media:migrate` (compresses images to WebP and uploads).
2. Run `npm run supabase:media-urls` (updates CMS database paths).
3. Redeploy Vercel — production no longer needs Git LFS for images.
4. Optional: remove `public/images` from the repo in a future cleanup.

Regenerate seed paths after local file changes:

```bash
npm run seed:generate
npm run supabase:seed-cms   # or migrate script as appropriate
```

## Local development

If LFS is blocked on GitHub:

- You already have files locally → dev works.
- Fresh clone → run `npm run media:pull` only after LFS quota is restored, or copy `public/images/` from a machine that has them.

## Why LFS was used

`Director_2.mp4` and other portfolio files exceed GitHub’s **100MB per-file** limit; LFS was used for the whole `public/images/**` tree. See `.gitattributes`.
