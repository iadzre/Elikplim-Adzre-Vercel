import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const QUICK_LINKS = [
  { to: '/admin/hero', label: 'Edit Hero' },
  { to: '/admin/home-slides', label: 'Home Slides' },
  { to: '/admin/about', label: 'Edit About' },
  { to: '/admin/career', label: 'Career Timeline' },
  { to: '/admin/projects', label: 'Manage Projects' },
  { to: '/admin/shop/resources', label: 'Shop Resources' },
  { to: '/admin/shop/categories', label: 'Shop Categories' },
  { to: '/admin/shop/profiles', label: 'Shop Profiles' },
  { to: '/admin/shop/reviews', label: 'Shop Reviews' },
  { to: '/admin/shop/purchases', label: 'Shop Purchases' },
  { to: '/admin/skills', label: 'Manage Skills' },
  { to: '/admin/testimonials', label: 'Testimonials' },
  { to: '/admin/contact', label: 'Contact & Social' },
  { to: '/admin/navigation', label: 'Navigation' },
  { to: '/admin/settings', label: 'Site Settings' },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    projectsPublished: 0,
    projectsDraft: 0,
    testimonialsPending: 0,
    testimonialsApproved: 0,
    skills: 0,
    homeSlides: 0,
    navLinks: 0,
    shopPublished: 0,
    shopDraft: 0,
    shopPendingReviews: 0,
    shopPurchases: 0,
    hasHero: false,
    hasAbout: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    document.title = 'Dashboard — CMS';
    async function load() {
      const [
        pub,
        draft,
        pending,
        approved,
        skills,
        slides,
        nav,
        shopPub,
        shopDr,
        shopReviews,
        shopPurch,
        hero,
        about,
      ] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
        supabase.from('home_slides').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('nav_links').select('id', { count: 'exact', head: true }).eq('visible', true),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('resources').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('purchases').select('id', { count: 'exact', head: true }).eq('payment_status', 'completed'),
        supabase.from('hero').select('id').limit(1).maybeSingle(),
        supabase.from('about').select('id').limit(1).maybeSingle(),
      ]);

      const firstError =
        pub.error ||
        draft.error ||
        pending.error ||
        approved.error ||
        skills.error ||
        slides.error ||
        nav.error ||
        shopPub.error ||
        shopDr.error ||
        shopReviews.error ||
        shopPurch.error ||
        hero.error ||
        about.error;

      setStats({
        projectsPublished: pub.count ?? 0,
        projectsDraft: draft.count ?? 0,
        testimonialsPending: pending.count ?? 0,
        testimonialsApproved: approved.count ?? 0,
        skills: skills.count ?? 0,
        homeSlides: slides.count ?? 0,
        navLinks: nav.count ?? 0,
        shopPublished: shopPub.count ?? 0,
        shopDraft: shopDr.count ?? 0,
        shopPendingReviews: shopReviews.count ?? 0,
        shopPurchases: shopPurch.count ?? 0,
        hasHero: Boolean(hero.data),
        hasAbout: Boolean(about.data),
        loading: false,
        error: firstError?.message ?? null,
      });
    }
    load();
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      <p className="admin-page-lead">
        Changes here update the live site.{' '}
        <a href="/" target="_blank" rel="noopener noreferrer">
          View live site →
        </a>
      </p>

      {stats.error && (
        <div className="admin-alert admin-alert-error" role="alert">
          Could not load some stats: {stats.error}. Check Supabase RLS and that you are signed in.
        </div>
      )}

      {stats.loading ? (
        <p className="admin-text-muted">Loading stats…</p>
      ) : (
        <div className="admin-grid-4" style={{ marginBottom: 'var(--admin-space-6)' }}>
          <div className="admin-stat-card">
            <h3>Shop</h3>
            <div className="value">{stats.shopPublished + stats.shopDraft}</div>
            <div className="sub">
              {stats.shopPublished} published · {stats.shopDraft} draft · {stats.shopPurchases} sales
            </div>
          </div>
          <div className="admin-stat-card">
            <h3>Projects</h3>
            <div className="value">{stats.projectsPublished + stats.projectsDraft}</div>
            <div className="sub">
              {stats.projectsPublished} published · {stats.projectsDraft} draft
            </div>
          </div>
          <div className="admin-stat-card">
            <h3>Testimonials</h3>
            <div className="value">{stats.testimonialsPending + stats.testimonialsApproved}</div>
            <div className="sub">
              {stats.testimonialsPending} pending · {stats.testimonialsApproved} approved
            </div>
          </div>
          <div className="admin-stat-card">
            <h3>Skills</h3>
            <div className="value">{stats.skills}</div>
            <div className="sub">Shown on About page</div>
          </div>
          <div className="admin-stat-card">
            <h3>Home</h3>
            <div className="value">{stats.homeSlides}</div>
            <div className="sub">
              slides · hero {stats.hasHero ? '✓' : '—'} · about {stats.hasAbout ? '✓' : '—'}
            </div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h2 className="admin-section-title">Content wired to the public site</h2>
        <div className="admin-prose">
          <ul>
            <li>
              <strong>Projects</strong> — CMS <code>projects</code> + <code>project_gallery_items</code> (modal
              gallery); legacy portfolio media is used only when a project has no CMS gallery rows.
            </li>
            <li>
              <strong>Testimonials</strong> — CMS <code>testimonials</code> (approved), else legacy table.
            </li>
            <li>
              <strong>About</strong> — CMS <code>about</code> + <code>skills</code>; career uses{' '}
              <code>career_timeline_entries</code>.
            </li>
            <li>
              <strong>Home</strong> — <code>home_slides</code> carousel; hero headline/CTA/overlay from{' '}
              <code>hero</code>.
            </li>
            <li>
              <strong>Header / footer</strong> — <code>nav_links</code>, <code>contact_info</code>,{' '}
              <code>site_settings</code>.
            </li>
            <li>
              <strong>Shop</strong> — <code>resources</code>, <code>resource_categories</code>,{' '}
              <code>profiles</code>, <code>purchases</code>, <code>reviews</code>. Manage under Shop in the sidebar.
            </li>
          </ul>
        </div>
        {stats.shopPublished === 0 && (
          <p className="admin-callout admin-callout-warning">
            No published shop resources. Run <code>npm run supabase:db-push</code> and{' '}
            <code>npm run supabase:seed-resources</code>, or add resources in Shop.
          </p>
        )}
        {stats.shopPendingReviews > 0 && (
          <p className="admin-callout-link">
            <Link to="/admin/shop/reviews">{stats.shopPendingReviews} review(s) awaiting approval →</Link>
          </p>
        )}
        {stats.projectsPublished === 0 && (
          <p className="admin-callout admin-callout-warning">
            No published CMS projects yet. Run <code>npm run supabase:migrate-cms</code> or publish projects in
            Manage Projects.
          </p>
        )}
      </div>

      <div className="admin-card">
        <h2 className="admin-section-title">Quick links</h2>
        <div className="admin-quick-links">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="admin-btn admin-btn-secondary admin-btn-sm">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
