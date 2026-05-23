import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { confirmAction, formatDate } from '../../lib/adminUtils';

export function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [dragId, setDragId] = useState(null);

  async function load() {
    const { data, error } = await supabase.from('projects').select('*').order('display_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setProjects(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Projects — CMS';
    load();
  }, []);

  async function toggleField(id, field, value) {
    const { error } = await supabase.from('projects').update({ [field]: value }).eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function move(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= projects.length) return;
    const err = await swapOrder(supabase, 'projects', projects[index], projects[j]);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  async function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const from = projects.find((p) => p.id === dragId);
    const to = projects.find((p) => p.id === targetId);
    if (!from || !to) return;
    const err = await swapOrder(supabase, 'projects', from, to);
    setDragId(null);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Projects
        </h1>
        <Link to="/admin/projects/new" className="admin-btn admin-btn-primary">
          Add New Project
        </Link>
      </div>
      <AdminFeedback feedback={feedback} />

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>
      ) : projects.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)' }}>No projects yet.</p>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th />
                <th>Cover</th>
                <th>Title</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => (
                <tr
                  key={p.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(p.id)}
                >
                  <td>
                    <ReorderControls
                      draggable
                      onDragStart={() => setDragId(p.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(p.id)}
                      canMoveUp={i > 0}
                      canMoveDown={i < projects.length - 1}
                      onMoveUp={() => move(i, -1)}
                      onMoveDown={() => move(i, 1)}
                    />
                  </td>
                  <td>
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt="" className="admin-thumb" />
                    ) : (
                      <div className="admin-thumb" />
                    )}
                  </td>
                  <td>
                    {p.title}
                    {p.featured && (
                      <span className="admin-badge admin-badge-featured" style={{ marginLeft: '0.35rem' }}>
                        Featured
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{(p.tags ?? []).join(', ') || '—'}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${p.status === 'published' ? 'published' : 'draft'}`}>{p.status}</span>
                  </td>
                  <td>{formatDate(p.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <Link to={`/admin/projects/${p.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                        Edit
                      </Link>
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleField(p.id, 'featured', !p.featured)}>
                        {p.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => toggleField(p.id, 'status', p.status === 'published' ? 'draft' : 'published')}
                      >
                        {p.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                      <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
