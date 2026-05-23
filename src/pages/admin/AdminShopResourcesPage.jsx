import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { confirmAction, formatDate } from '../../lib/adminUtils';
import { LazyImage } from '../../components/shared/LazyImage';

export function AdminShopResourcesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const { data, error } = await supabase
      .from('resources')
      .select('id, slug, title, thumbnail_url, pricing_type, price, status, featured, download_count, created_at, resource_categories(name)')
      .order('created_at', { ascending: false });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Shop Resources — CMS';
    load();
  }, []);

  async function toggleField(id, field, value) {
    const { error } = await supabase.from('resources').update({ [field]: value }).eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this resource and its file records?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Shop — Resources
        </h1>
        <Link to="/admin/shop/resources/new" className="admin-btn admin-btn-primary">
          Add resource
        </Link>
      </div>
      <AdminFeedback feedback={feedback} />

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)' }}>
          No resources in Supabase. Run <code>npm run supabase:seed-resources</code> or add one.
        </p>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Downloads</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.thumbnail_url ? (
                      <LazyImage src={r.thumbnail_url} alt="" className="admin-thumb rounded" />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    {r.title}
                    {r.featured && (
                      <span className="admin-badge admin-badge-featured" style={{ marginLeft: '0.35rem' }}>
                        Featured
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>
                    {r.resource_categories?.name ?? '—'}
                  </td>
                  <td>{r.pricing_type === 'free' ? 'Free' : `$${r.price}`}</td>
                  <td>
                    <span className={`admin-badge admin-badge-${r.status === 'published' ? 'published' : 'draft'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.download_count ?? 0}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <Link to={`/admin/shop/resources/${r.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() => toggleField(r.id, 'featured', !r.featured)}
                      >
                        {r.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        onClick={() =>
                          toggleField(r.id, 'status', r.status === 'published' ? 'draft' : 'published')
                        }
                      >
                        {r.status === 'published' ? 'Draft' : 'Publish'}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(r.id)}
                      >
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
