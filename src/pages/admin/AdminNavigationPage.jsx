import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { confirmAction } from '../../lib/adminUtils';

export function AdminNavigationPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const { data, error } = await supabase.from('nav_links').select('*').order('display_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Navigation — CMS';
    load();
  }, []);

  function updateLocal(id, patch) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleAdd() {
    const { count } = await supabase.from('nav_links').select('id', { count: 'exact', head: true });
    const { data, error } = await supabase
      .from('nav_links')
      .insert({ label: 'New link', href: '/', visible: true, display_order: count ?? 0 })
      .select()
      .single();
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows((list) => [...list, data]);
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this nav item?')) return;
    const { error } = await supabase.from('nav_links').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows((list) => list.filter((r) => r.id !== id));
  }

  async function handleSave() {
    setSaving(true);
    setFeedback(null);
    const updates = rows.map((r) =>
      supabase
        .from('nav_links')
        .update({ label: r.label, href: r.href, visible: r.visible, display_order: r.display_order })
        .eq('id', r.id)
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    setSaving(false);
    setFeedback(err ? { type: 'error', message: err.message } : { type: 'success', message: 'Navigation saved.' });
  }

  async function move(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const err = await swapOrder(supabase, 'nav_links', rows[index], rows[j]);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  if (loading) return <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Navigation
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="admin-btn admin-btn-secondary" onClick={handleAdd}>
            Add Item
          </button>
          <button type="button" className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <AdminFeedback feedback={feedback} />

      {rows.map((r, i) => (
        <div key={r.id} className="admin-card">
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem' }}>
            <ReorderControls
              canMoveUp={i > 0}
              canMoveDown={i < rows.length - 1}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, 1)}
            />
            <div>
              <div className="admin-grid-2">
                <AdminField label="Label">
                  <input className="admin-input" value={r.label ?? ''} onChange={(e) => updateLocal(r.id, { label: e.target.value })} />
                </AdminField>
                <AdminField label="Href">
                  <input className="admin-input" value={r.href ?? ''} onChange={(e) => updateLocal(r.id, { href: e.target.value })} />
                </AdminField>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input type="checkbox" checked={!!r.visible} onChange={(e) => updateLocal(r.id, { visible: e.target.checked })} />
                Visible
              </label>
              <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => handleDelete(r.id)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
