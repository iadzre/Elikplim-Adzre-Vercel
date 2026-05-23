import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { formatDate } from '../../lib/adminUtils';

export function AdminShopNewsletterPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    document.title = 'Shop Newsletter — CMS';
    supabase
      .from('newsletters')
      .select('id, email, subscribed_at, source, unsubscribed_at')
      .is('unsubscribed_at', null)
      .order('subscribed_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setFeedback({ type: 'error', message: error.message });
        else setRows(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Shop — Newsletter</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
        {rows.length} active subscriber{rows.length === 1 ? '' : 's'}
      </p>
      <AdminFeedback feedback={feedback} />

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)' }}>No subscribers yet.</p>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Subscribed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.email}</td>
                  <td style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>{r.source ?? '—'}</td>
                  <td>{formatDate(r.subscribed_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
