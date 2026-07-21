import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { confirmAction, formatDate } from '../../lib/adminUtils';

export function AdminNotesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('all');

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id, name, email, topic, message, created_at')
      .order('created_at', { ascending: false });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Notes — CMS';
    load();
  }, []);

  const topics = useMemo(
    () => Array.from(new Set(rows.map((r) => r.topic).filter(Boolean))).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (topic !== 'all' && r.topic !== topic) return false;
      if (!q) return true;
      return [r.name, r.email, r.topic, r.message]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [rows, search, topic]);

  async function handleDelete(id) {
    if (!confirmAction('Delete this note? This cannot be undone.')) return;
    const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setFeedback({ type: 'success', message: 'Note deleted.' });
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  }

  return (
    <>
      <h1 className="admin-page-title">Notes Left</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
        {filtered.length} of {rows.length} note{rows.length === 1 ? '' : 's'} from the “Leave a Note” form
      </p>
      <AdminFeedback feedback={feedback} />

      {!loading && rows.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.75rem 0 1rem' }}>
          <input
            type="search"
            className="admin-input"
            placeholder="Search name, email, or message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: '1 1 16rem', minWidth: '12rem' }}
          />
          <select
            className="admin-select"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            style={{ flex: '0 0 auto' }}
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <p className="admin-loading-line">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="admin-text-muted">No notes yet.</p>
      ) : filtered.length === 0 ? (
        <p className="admin-text-muted">No notes match your filters.</p>
      ) : (
        <div className="admin-card admin-card-flush">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Topic</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <a
                        href={`mailto:${r.email}`}
                        style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}
                      >
                        {r.email}
                      </a>
                    </td>
                    <td>{r.topic}</td>
                    <td style={{ maxWidth: '32rem', whiteSpace: 'pre-wrap' }}>{r.message}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.created_at)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm"
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
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
