import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { AdminField } from '../../components/admin/AdminField';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { confirmAction } from '../../lib/adminUtils';

const emptyEntry = {
  position: 'top',
  left_offset: '10%',
  period: '',
  title: '',
  detail: '',
  is_published: true,
};

export function AdminCareerPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [draft, setDraft] = useState(emptyEntry);

  async function load() {
    const { data, error } = await supabase
      .from('career_timeline_entries')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setEntries(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Career Timeline — CMS';
    load();
  }, []);

  function updateLocal(id, patch) {
    setEntries((list) => list.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!draft.title.trim() || !draft.period.trim()) return;
    const { count } = await supabase
      .from('career_timeline_entries')
      .select('id', { count: 'exact', head: true });
    const { error } = await supabase.from('career_timeline_entries').insert({
      ...draft,
      title: draft.title.trim(),
      period: draft.period.trim(),
      detail: draft.detail.trim(),
      sort_order: count ?? 0,
    });
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setDraft(emptyEntry);
      load();
    }
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this timeline entry?')) return;
    const { error } = await supabase.from('career_timeline_entries').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleSaveAll() {
    setSaving(true);
    const results = await Promise.all(
      entries.map((entry, index) =>
        supabase
          .from('career_timeline_entries')
          .update({
            position: entry.position,
            left_offset: entry.left_offset,
            period: entry.period,
            title: entry.title,
            detail: entry.detail,
            sort_order: index,
            is_published: entry.is_published,
          })
          .eq('id', entry.id)
      )
    );
    const err = results.find((r) => r.error)?.error;
    setSaving(false);
    setFeedback(err ? { type: 'error', message: err.message } : { type: 'success', message: 'Timeline saved.' });
  }

  function move(index, delta) {
    setEntries((list) => swapOrder(list, index, index + delta));
  }

  return (
    <>
      <h1 className="admin-page-title">Career timeline</h1>
      <p style={{ color: 'var(--admin-muted)', marginBottom: '1.5rem' }}>
        Horizontal timeline on the About page.
      </p>
      {feedback && <AdminFeedback feedback={feedback} />}

      <form className="admin-card" onSubmit={handleAdd} style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem' }}>Add entry</h3>
        <div className="admin-grid-2">
          <AdminField label="Position (top / bottom)">
            <select
              className="admin-input"
              value={draft.position}
              onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))}
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </AdminField>
          <AdminField label="Left offset (CSS)">
            <input
              className="admin-input"
              value={draft.left_offset}
              onChange={(e) => setDraft((d) => ({ ...d, left_offset: e.target.value }))}
              placeholder="10%"
            />
          </AdminField>
          <AdminField label="Period">
            <input
              className="admin-input"
              value={draft.period}
              onChange={(e) => setDraft((d) => ({ ...d, period: e.target.value }))}
            />
          </AdminField>
          <AdminField label="Title">
            <input
              className="admin-input"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </AdminField>
        </div>
        <AdminField label="Detail">
          <textarea
            className="admin-textarea"
            rows={3}
            value={draft.detail}
            onChange={(e) => setDraft((d) => ({ ...d, detail: e.target.value }))}
          />
        </AdminField>
        <button type="submit" className="admin-btn admin-btn-primary">
          Add entry
        </button>
      </form>

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>
      ) : (
        <>
          {entries.map((entry, i) => (
            <div key={entry.id} className="admin-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <ReorderControls
                  canMoveUp={i > 0}
                  canMoveDown={i < entries.length - 1}
                  onMoveUp={() => move(i, -1)}
                  onMoveDown={() => move(i, 1)}
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => handleDelete(entry.id)}
                >
                  Delete
                </button>
              </div>
              <div className="admin-grid-2">
                <AdminField label="Position">
                  <select
                    className="admin-input"
                    value={entry.position}
                    onChange={(e) => updateLocal(entry.id, { position: e.target.value })}
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                  </select>
                </AdminField>
                <AdminField label="Left offset">
                  <input
                    className="admin-input"
                    value={entry.left_offset}
                    onChange={(e) => updateLocal(entry.id, { left_offset: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Period">
                  <input
                    className="admin-input"
                    value={entry.period}
                    onChange={(e) => updateLocal(entry.id, { period: e.target.value })}
                  />
                </AdminField>
                <AdminField label="Title">
                  <input
                    className="admin-input"
                    value={entry.title}
                    onChange={(e) => updateLocal(entry.id, { title: e.target.value })}
                  />
                </AdminField>
              </div>
              <AdminField label="Detail">
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={entry.detail}
                  onChange={(e) => updateLocal(entry.id, { detail: e.target.value })}
                />
              </AdminField>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={entry.is_published}
                  onChange={(e) => updateLocal(entry.id, { is_published: e.target.checked })}
                />
                Published on site
              </label>
            </div>
          ))}
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            disabled={saving || !entries.length}
            onClick={handleSaveAll}
          >
            {saving ? 'Saving…' : 'Save timeline order & fields'}
          </button>
        </>
      )}
    </>
  );
}
