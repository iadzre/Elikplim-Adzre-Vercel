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
| `testimonials` | Projects page carousel | `SELECT` published |
| `projects` | Portfolio tiles | `SELECT` published |
| `project_media` | Gallery images/videos per project (FK → `projects`) | `SELECT` when parent published |
| `home_slides` | Home hero slider | `SELECT` published |
| `about_bio_paragraphs` | About page bio copy | `SELECT` published |
| `skills` | About page skill tags | `SELECT` published |
| `career_timeline_entries` | About page timeline | `SELECT` published |

Indexes are on `(is_published, sort_order)` for content tables and `project_media(project_id, sort_order)`.

### Row Level Security

- **Anonymous:** insert contact submissions; read published content.
- **Authenticated:** full read/write on CMS tables (for a future admin UI); read contact submissions.
- Contact submissions are never readable by anonymous users.

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

## Project structure

```
public/           # robots.txt; portfolio media at public/images/ (stable /images/* URLs)
src/
  assets/         # Logo, profile photo, software icons (bundled imports)
  components/     # UI (Header, Footer, SidePanel, ProjectModal, …)
  pages/          # Route pages
  hooks/          # Supabase data hooks
  context/        # Side panel state
  lib/            # supabase.js + contentMappers.js
  styles/         # Global CSS (single source of truth)
supabase/
  migrations/     # SQL schema
  seed.sql        # Seed data
```

## Media & Git

Portfolio files in `public/images/` (~900MB) are tracked with [Git LFS](https://git-lfs.com). After clone: `git lfs install && git lfs pull`.

After clone: `git lfs install` then `git lfs pull`

**Remote:** [github.com/iadzre/Elikplim-Adzre-Vercel](https://github.com/iadzre/Elikplim-Adzre-Vercel)

## Notes

- **Portfolio media** lives in `public/images/` and is referenced as `/images/...` in Supabase seed rows.
- **UI branding** (logo, profile, tool icons) is in `src/assets/` and imported via `src/assets/branding.js`.
- **Content** is loaded from Supabase at runtime; update rows in the dashboard or edit `supabase/seed.sql` and re-run it.
- **No login** on this site; Supabase Auth is not required for visitors.
- **Styling** uses Tailwind via CDN in `index.html` (no local Tailwind build).
