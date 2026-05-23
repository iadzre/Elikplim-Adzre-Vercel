import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const QUICK_LINKS = [
  { to: '/admin/hero', label: 'Edit Hero' },
  { to: '/admin/about', label: 'Edit About' },
  { to: '/admin/projects', label: 'Manage Projects' },
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
    loading: true,
  });

  useEffect(() => {
    document.title = 'Dashboard — CMS';
    async function load() {
      const [pub, draft, pending, approved, skills] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('testimonials').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('skills').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        projectsPublished: pub.count ?? 0,
        projectsDraft: draft.count ?? 0,
        testimonialsPending: pending.count ?? 0,
        testimonialsApproved: approved.count ?? 0,
        skills: skills.count ?? 0,
        loading: false,
      });
    }
    load();
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Dashboard</h1>
      <p style={{ color: 'var(--admin-muted)', marginBottom: '1.5rem' }}>
        <a href="/" target="_blank" rel="noopener noreferrer">
          View live site →
        </a>
      </p>

      {stats.loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading stats…</p>
      ) : (
        <div className="admin-grid-4" style={{ marginBottom: '1.5rem' }}>
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
            <div className="sub">Total skills listed</div>
          </div>
        </div>
      )}

      <div className="admin-card">
        <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Quick links</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
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
