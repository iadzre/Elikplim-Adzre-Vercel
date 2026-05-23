import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { confirmAction, formatDate } from '../../lib/adminUtils';

const TABS = [
  { id: false, label: 'Pending' },
  { id: true, label: 'Approved' },
];

export function AdminShopReviewsPage() {
  const [approved, setApproved] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, review_text, approved, created_at, resources(title, slug), profiles(full_name, username)')
      .eq('approved', approved)
      .order('created_at', { ascending: false });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Shop Reviews — CMS';
    load();
  }, [approved]);

  async function setReviewApproved(id, value) {
    const { error } = await supabase.from('reviews').update({ approved: value }).eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this review?')) return;
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  return (
    <>
      <h1 className="admin-page-title">Shop — Reviews</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button
            key={String(t.id)}
            type="button"
            className={`admin-btn admin-btn-sm ${approved === t.id ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
            onClick={() => setApproved(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <AdminFeedback feedback={feedback} />

      {loading ? (
        <p className="admin-loading-line">Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-text-muted">No reviews in this tab.</p>
      ) : (
        <div className="admin-card admin-card-flush">
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>User</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td>{r.resources?.title ?? '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {r.profiles?.full_name ?? r.profiles?.username ?? '—'}
                  </td>
                  <td>{r.rating}★</td>
                  <td style={{ maxWidth: 240, fontSize: '0.85rem' }}>{r.review_text ?? '—'}</td>
                  <td>{formatDate(r.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {!r.approved && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-primary admin-btn-sm"
                          onClick={() => setReviewApproved(r.id, true)}
                        >
                          Approve
                        </button>
                      )}
                      {r.approved && (
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => setReviewApproved(r.id, false)}
                        >
                          Unapprove
                        </button>
                      )}
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
        </div>
      )}
    </>
  );
}
