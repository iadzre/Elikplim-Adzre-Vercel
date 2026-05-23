import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { formatDate } from '../../lib/adminUtils';

export function AdminShopPurchasesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    document.title = 'Shop Purchases — CMS';
    async function load() {
      const { data, error } = await supabase
        .from('purchases')
        .select(
          'id, amount_paid, currency, payment_status, payment_provider, purchased_at, created_at, resources(title, slug), profiles(full_name, username)'
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) {
        setFeedback({ type: 'error', message: error.message });
      } else {
        setItems(data ?? []);
        const total = (data ?? [])
          .filter((p) => p.payment_status === 'completed')
          .reduce((sum, p) => sum + Number(p.amount_paid ?? 0), 0);
        setRevenue(total);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <h1 className="admin-page-title">Shop — Purchases</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
        Completed revenue (loaded rows): <strong>${revenue.toFixed(2)}</strong>
      </p>
      <AdminFeedback feedback={feedback} />

      {loading ? (
        <p className="admin-loading-line">Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-text-muted">No purchases yet.</p>
      ) : (
        <div className="admin-card admin-card-flush">
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td>{p.resources?.title ?? '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {p.profiles?.full_name ?? p.profiles?.username ?? '—'}
                  </td>
                  <td>
                    {p.currency} {Number(p.amount_paid).toFixed(2)}
                  </td>
                  <td>
                    <span
                      className={`admin-badge admin-badge-${p.payment_status === 'completed' ? 'published' : 'draft'}`}
                    >
                      {p.payment_status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--admin-muted)' }}>{p.payment_provider ?? '—'}</td>
                  <td>{formatDate(p.purchased_at ?? p.created_at)}</td>
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
