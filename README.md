# Elikplim Adzre — Portfolio (React + Vite + Supabase)

Production-ready React portfolio migrated from the original static HTML site. Visual design, CSS, and interactions are preserved; the contact form and optional CMS data use Supabase.

## Tech stack

- **Frontend:** React 18, React Router 6, Vite
- **Styling:** Tailwind CSS (CDN, same as original) + global `src/styles/styles.css`
- **Backend:** Supabase (Postgres + RLS)
- **Deploy:** Vercel

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in your Supabase project values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Description |
   |----------|-------------|
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open the URL shown in the terminal (usually `http://localhost:5173`).

4. **Production build**

   ```bash
   npm run build
   npm run preview
   ```

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL Editor, run the migration:

   `supabase/migrations/001_initial_schema.sql`

3. Seed the database with portfolio content:

   `supabase/seed.sql`

4. Copy **Project URL** and **anon public** key into `.env.local`.

5. **Contact form:** Submissions appear in Table Editor → `contact_submissions`. No visitor auth is required.

### Database schema

| Table | Purpose | Public access |
|-------|---------|---------------|
| `contact_submissions` | Leave a Note form (PII) | `INSERT` only |
| `portfolio_testimonials` | Projects page carousel | `SELECT` published |
| `portfolio_projects` | Portfolio tiles | `SELECT` published |
| `project_media` | Gallery images/videos per project (FK → `portfolio_projects`) | `SELECT` when parent published |
| `home_slides` | Home hero slider | `SELECT` published |
| `about_bio_paragraphs` | About page bio copy | `SELECT` published |
| `portfolio_skills` | About page skill tags | `SELECT` published |
| `career_timeline_entries` | About page timeline | `SELECT` published |

Indexes are on `(is_published, sort_order)` for content tables and `project_media(project_id, sort_order)`.

### Row Level Security

- **Anonymous:** insert contact submissions; read published content.
- **Authenticated:** full read/write on CMS tables (for a future admin UI); read contact submissions.
- Contact submissions are never readable by anonymous users.

## CMS admin backend

Migrations: `002_cms_schema.sql` (CMS tables + RLS), `003_storage_buckets.sql` (media buckets), `004_project_gallery.sql` (gallery items + `projects.media_type`), `005_project_gallery_storage.sql` (`project-gallery` bucket).

**Public site data flow:** Hooks read **CMS tables first** (`hero`, `about`, `projects` + `project_gallery_items`, `skills`, `testimonials`, `contact_info`, `nav_links`, `site_settings`, `home_slides`). If a CMS table is empty, they fall back to legacy `portfolio_*` / `about_bio_paragraphs` tables. Project modal galleries use CMS gallery rows when present; otherwise legacy `project_media` is merged by matching project title.

### Apply migrations & seed CMS

```bash
supabase link --project-ref YOUR_PROJECT_REF
npm run supabase:db-push           # apply all migrations (002–005)
npm run supabase:seed-cms          # default hero, about, nav, contact rows
npm run supabase:migrate-cms       # copy portfolio_* + gallery into CMS (one-time)
```

Or paste `supabase/seed-cms.sql` and `supabase/migrate-portfolio-to-cms.sql` into the Supabase SQL Editor.

### Create the admin user (one owner)

1. Supabase Dashboard → **Authentication** → **Users** → **Add user** (email + password).
2. Disable public sign-ups: **Authentication** → **Providers** → Email → turn off **Enable sign up** (recommended after admin exists).

### Admin routes

| Path | Description |
|------|-------------|
| `/admin/login` | Email/password sign-in |
| `/admin` | Dashboard (stats + quick links) |
| `/admin/hero` | Hero headline, CTA, background |
| `/admin/home-slides` | Home carousel images |
| `/admin/about` | About / bio editor |
| `/admin/career` | Career timeline entries |
| `/admin/projects` | Projects list |
| `/admin/projects/new` | Add project |
| `/admin/projects/:id` | Edit project + **gallery (modal)** |
| `/admin/skills` | Skills manager |
| `/admin/testimonials` | Testimonials (pending / approved / rejected) |
| `/admin/contact` | Contact & social links |
| `/admin/navigation` | Nav links |
| `/admin/settings` | Site title, meta, colors, favicon |

Admin UI is isolated at `/admin` (separate dark theme; does not change public site styles).

### Storage buckets

| Bucket | Purpose |
|--------|---------|
| `hero-backgrounds` | Hero images/videos |
| `project-covers` | Project cover images |
| `project-gallery` | Modal gallery images/videos |
| `profile-images` | Profile photo / CV PDF |
| `testimonial-avatars` | Testimonial author photos |

Upload from admin code: `uploadFile(bucket, file, path)` in `src/lib/upload.js`.

### Auth helpers (`src/lib/supabase.js`)

- `signIn(email, password)`
- `signOut()`
- `getSession()`

## Deploy to Vercel

1. Push the repository to GitHub (or connect your Git provider in Vercel).
2. **Import project** in [vercel.com](https://vercel.com).
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variables in Vercel → Settings → Environment Variables:

   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

7. Deploy. `vercel.json` includes SPA rewrites so client routes (`/about`, `/projects`, etc.) work on refresh.

## Routes

| Path | Page |
|------|------|
| `/` | Home (hero slider) |
| `/about` | About Me |
| `/projects` | Projects + testimonials |
| `/leave-a-note` | Contact form |
| `/admin/login` | CMS sign-in |
| `/admin` | CMS dashboard (protected) |

## Project structure

```
public/           # robots.txt; portfolio media at public/images/ (stable /images/* URLs)
src/
  assets/         # Logo, profile photo, software icons (bundled imports)
  components/     # UI (Header, Footer, SidePanel, ProjectModal, admin/, …)
  pages/          # Route pages (+ pages/admin/)
  context/        # Side panel state
  hooks/          # Supabase data hooks (CMS-first, portfolio fallback)
  lib/            # supabase.js, contentMappers.js, cmsMappers.js, upload.js
  styles/         # styles.css (public) + admin.css (CMS only)
supabase/
  migrations/     # SQL schema
  seed.sql        # Seed data
```

## Media & Git

Portfolio files in `public/images/` (~900MB) are tracked with [Git LFS](https://git-lfs.com). After clone: `npm run media:pull` (or `git lfs install && git lfs pull`).

**Vercel:** Enable **Git → Git Large File Storage (LFS)** in project settings, then redeploy. `vercel.json` also runs `git lfs pull` during install. Without LFS, production serves 133-byte pointer files instead of images.

To regenerate Supabase image links after adding files to `public/images/`:

```bash
npm run seed:generate
supabase db query --file supabase/seed.sql --linked
```

After clone: `git lfs install` then `git lfs pull`

**Remote:** [github.com/iadzre/Elikplim-Adzre-Vercel](https://github.com/iadzre/Elikplim-Adzre-Vercel)

## Notes

- **Portfolio media** lives in `public/images/` and is referenced as `/images/...` in Supabase seed rows.
- **UI branding** (logo, profile, tool icons) is in `src/assets/` and imported via `src/assets/branding.js`.
- **Content** is loaded from Supabase at runtime; update rows in the dashboard or edit `supabase/seed.sql` and re-run it.
- **No login** on this site; Supabase Auth is not required for visitors.
- **Styling** uses Tailwind via CDN in `index.html` (no local Tailwind build).
