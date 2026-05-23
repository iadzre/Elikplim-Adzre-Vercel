# Git LFS budget exceeded

Portfolio media under `public/images/` (~900MB, 140 files) is stored in **Git LFS**. GitHub blocks LFS downloads when the account’s **storage or bandwidth** quota is used up. You may see:

> This repository exceeded its LFS budget.

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

Host files in **Supabase Storage** (buckets already exist: `project-covers`, `project-gallery`, `hero-backgrounds`):

1. Upload assets from your local `public/images/` via the CMS (project covers/gallery) or Supabase dashboard.
2. Ensure CMS `projects` / `project_gallery_items` use **public Supabase URLs**, not `/images/…` paths.
3. After everything is on Supabase, you can stop relying on LFS entirely (optional: remove `public/images` from the repo in a future cleanup).

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
