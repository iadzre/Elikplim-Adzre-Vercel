import { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/admin.css';
import { signOut } from '../../lib/supabase';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', end: true, icon: '◉', label: 'Dashboard' }],
  },
  {
    label: 'Site',
    items: [
      { to: '/admin/hero', icon: '▣', label: 'Hero' },
      { to: '/admin/home-slides', icon: '▤', label: 'Home Slides' },
      { to: '/admin/about', icon: '◎', label: 'About' },
      { to: '/admin/career', icon: '◇', label: 'Career' },
      { to: '/admin/projects', icon: '▦', label: 'Projects' },
      { to: '/admin/skills', icon: '◆', label: 'Skills' },
      { to: '/admin/testimonials', icon: '◈', label: 'Testimonials' },
      { to: '/admin/contact', icon: '✉', label: 'Contact' },
      { to: '/admin/notes', icon: '✎', label: 'Notes' },
      { to: '/admin/navigation', icon: '☰', label: 'Navigation' },
    ],
  },
  {
    label: 'Shop',
    items: [
      { to: '/admin/shop/resources', icon: '◧', label: 'Resources' },
      { to: '/admin/shop/categories', icon: '▤', label: 'Categories' },
      { to: '/admin/shop/profiles', icon: '◎', label: 'Profiles' },
      { to: '/admin/shop/reviews', icon: '★', label: 'Reviews' },
      { to: '/admin/shop/purchases', icon: '$', label: 'Purchases' },
      { to: '/admin/shop/newsletter', icon: '✦', label: 'Newsletter' },
    ],
  },
  {
    label: 'Settings',
    items: [{ to: '/admin/settings', icon: '⚙', label: 'Site Settings' }],
  },
];

const PAGE_TITLES = [
  { match: /^\/admin\/shop\/resources\/[^/]+/, title: 'Edit resource' },
  { match: /^\/admin\/shop\/resources\/new/, title: 'New resource' },
  { match: /^\/admin\/shop\/resources/, title: 'Shop resources' },
  { match: /^\/admin\/shop\/categories/, title: 'Categories' },
  { match: /^\/admin\/shop\/profiles/, title: 'Profiles' },
  { match: /^\/admin\/shop\/reviews/, title: 'Reviews' },
  { match: /^\/admin\/shop\/purchases/, title: 'Purchases' },
  { match: /^\/admin\/shop\/newsletter/, title: 'Newsletter' },
  { match: /^\/admin\/projects\/[^/]+/, title: 'Edit project' },
  { match: /^\/admin\/projects\/new/, title: 'New project' },
  { match: /^\/admin\/projects/, title: 'Projects' },
  { match: /^\/admin\/hero/, title: 'Hero' },
  { match: /^\/admin\/home-slides/, title: 'Home slides' },
  { match: /^\/admin\/about/, title: 'About' },
  { match: /^\/admin\/career/, title: 'Career' },
  { match: /^\/admin\/skills/, title: 'Skills' },
  { match: /^\/admin\/testimonials/, title: 'Testimonials' },
  { match: /^\/admin\/contact/, title: 'Contact' },
  { match: /^\/admin\/notes/, title: 'Notes' },
  { match: /^\/admin\/navigation/, title: 'Navigation' },
  { match: /^\/admin\/settings/, title: 'Settings' },
  { match: /^\/admin\/?$/, title: 'Dashboard' },
];

function resolvePageTitle(pathname) {
  const found = PAGE_TITLES.find((entry) => entry.match.test(pathname));
  return found?.title ?? 'CMS';
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
  );

  const topbarTitle = useMemo(() => resolvePageTitle(location.pathname), [location.pathname]);

  useEffect(() => {
    document.documentElement.className = 'admin-route';
    document.body.className = 'admin-route';
    document.body.classList.remove('overflow-hidden', 'no-scroll');
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 768px)').matches) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-root admin-shell">
      {!collapsed && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setCollapsed(true)}
        />
      )}
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`} aria-label="CMS navigation">
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-title">Elikplim</span>
          <span className="admin-sidebar-brand-sub">Content Studio</span>
        </div>
        <nav className="admin-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="admin-nav-section">
              <span className="admin-nav-section-label">{section.label}</span>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                  title={item.label}
                >
                  <span className="admin-nav-icon" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="admin-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!collapsed}
            >
              ☰
            </button>
            <h2>{topbarTitle}</h2>
          </div>
          <div className="admin-topbar-actions">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn admin-btn-secondary admin-btn-sm"
            >
              View site ↗
            </a>
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
