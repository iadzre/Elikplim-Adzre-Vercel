import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { confirmAction, slugify } from '../../lib/adminUtils';

export function AdminShopCategoriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const { data, error } = await supabase
      .from('resource_categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Shop Categories — CMS';
    load();
  }, []);

  function updateLocal(id, patch) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  async function handleAdd() {
    const { count } = await supabase.from('resource_categories').select('id', { count: 'exact', head: true });
    const { data, error } = await supabase
      .from('resource_categories')
      .insert({
        name: 'New category',
        slug: `category-${Date.now()}`,
        display_order: count ?? 0,
        featured: false,
      })
      .select()
      .single();
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows((list) => [...list, data]);
  }

  async function saveRow(row) {
    const { error } = await supabase
      .from('resource_categories')
      .update({
        name: row.name,
        slug: row.slug,
        description: row.description,
        icon: row.icon,
        featured: row.featured,
        display_order: row.display_order,
      })
      .eq('id', row.id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else setFeedback({ type: 'success', message: 'Category saved.' });
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this category?')) return;
    const { error } = await supabase.from('resource_categories').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else setRows((list) => list.filter((r) => r.id !== id));
  }

  async function move(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const err = await swapOrder(supabase, 'resource_categories', rows[index], rows[j]);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  if (loading) return <p className="admin-loading-line">Loading…</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>
          Shop — Categories
        </h1>
        <button type="button" className="admin-btn admin-btn-primary" onClick={handleAdd}>
          Add category
        </button>
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
            <div className="admin-grid-2">
              <AdminField label="Name">
                <input
                  value={r.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    updateLocal(r.id, { name, slug: slugify(name) });
                  }}
                />
              </AdminField>
              <AdminField label="Slug">
                <input value={r.slug} onChange={(e) => updateLocal(r.id, { slug: slugify(e.target.value) })} />
              </AdminField>
              <AdminField label="Description">
                <input value={r.description ?? ''} onChange={(e) => updateLocal(r.id, { description: e.target.value })} />
              </AdminField>
              <AdminField label="Icon">
                <input value={r.icon ?? ''} onChange={(e) => updateLocal(r.id, { icon: e.target.value })} />
              </AdminField>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={!!r.featured}
                onChange={(e) => updateLocal(r.id, { featured: e.target.checked })}
              />
              Featured
            </label>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => saveRow(r)}>
              Save
            </button>
            <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(r.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
