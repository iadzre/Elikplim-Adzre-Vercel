import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import '../../styles/admin.css';
import { signOut } from '../../lib/supabase';

const NAV = [
  { to: '/admin', end: true, icon: '◉', label: 'Dashboard' },
  { to: '/admin/hero', icon: '▣', label: 'Hero' },
  { to: '/admin/home-slides', icon: '▤', label: 'Home Slides' },
  { to: '/admin/about', icon: '◎', label: 'About' },
  { to: '/admin/career', icon: '◇', label: 'Career' },
  { to: '/admin/projects', icon: '▦', label: 'Projects' },
  { to: '/admin/shop/resources', icon: '◧', label: 'Shop' },
  { to: '/admin/shop/categories', icon: '▤', label: 'Categories' },
  { to: '/admin/shop/profiles', icon: '◎', label: 'Profiles' },
  { to: '/admin/shop/reviews', icon: '★', label: 'Reviews' },
  { to: '/admin/shop/purchases', icon: '$', label: 'Purchases' },
  { to: '/admin/skills', icon: '◆', label: 'Skills' },
  { to: '/admin/testimonials', icon: '◈', label: 'Testimonials' },
  { to: '/admin/contact', icon: '✉', label: 'Contact' },
  { to: '/admin/navigation', icon: '☰', label: 'Navigation' },
  { to: '/admin/settings', icon: '⚙', label: 'Settings' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.documentElement.className = 'admin-route';
    document.body.className = 'admin-route';
    document.body.classList.remove('overflow-hidden', 'no-scroll');
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="admin-root admin-shell">
      <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>
        <div className="admin-sidebar-brand">
          <span>Elikplim CMS</span>
        </div>
        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <span className="admin-nav-icon" aria-hidden>
                {item.icon}
              </span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="admin-main-wrap">
        <header className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              className="admin-mobile-toggle"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle sidebar"
            >
              ☰
            </button>
            <h2>CMS Dashboard</h2>
          </div>
          <div className="admin-topbar-actions">
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary admin-btn-sm">
              View Site ↗
            </a>
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={handleSignOut}>
              Sign Out
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
