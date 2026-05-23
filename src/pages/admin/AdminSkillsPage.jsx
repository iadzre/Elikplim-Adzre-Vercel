import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { AdminField } from '../../components/admin/AdminField';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { confirmAction } from '../../lib/adminUtils';

export function AdminSkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: '', category: '', level: 50 });

  async function load() {
    const { data, error } = await supabase.from('skills').select('*').order('display_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setSkills(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Skills — CMS';
    load();
  }, []);

  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, /** @type {Record<string, typeof skills>} */ ({}));

  function updateLocal(id, patch) {
    setSkills((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    const { count } = await supabase.from('skills').select('id', { count: 'exact', head: true });
    const { error } = await supabase.from('skills').insert({
      name: newSkill.name.trim(),
      category: newSkill.category.trim() || null,
      level: newSkill.level,
      display_order: count ?? 0,
    });
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setNewSkill({ name: '', category: '', level: 50 });
      load();
    }
  }

  async function handleDelete(skillId) {
    if (!confirmAction('Delete this skill?')) return;
    const { error } = await supabase.from('skills').delete().eq('id', skillId);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleSaveAll() {
    setSaving(true);
    setFeedback(null);
    const updates = skills.map((s) =>
      supabase.from('skills').update({
        name: s.name,
        category: s.category,
        level: s.level,
        display_order: s.display_order,
      }).eq('id', s.id)
    );
    const results = await Promise.all(updates);
    const err = results.find((r) => r.error)?.error;
    setSaving(false);
    setFeedback(err ? { type: 'error', message: err.message } : { type: 'success', message: 'All skills saved.' });
    setEditingId(null);
  }

  async function moveInList(list, index, dir) {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const err = await swapOrder(supabase, 'skills', list[index], list[j]);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  return (
    <>
      <AdminPageHeader title="Skills">
        <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveAll} disabled={saving}>
          {saving ? 'Saving…' : 'Save All'}
        </button>
      </AdminPageHeader>
      <AdminFeedback feedback={feedback} />

      <form className="admin-card" onSubmit={handleAdd}>
        <p className="admin-label">Add new skill</p>
        <div className="admin-grid-2">
          <input className="admin-input" placeholder="Name" value={newSkill.name} onChange={(e) => setNewSkill((n) => ({ ...n, name: e.target.value }))} required />
          <input className="admin-input" placeholder="Category" value={newSkill.category} onChange={(e) => setNewSkill((n) => ({ ...n, category: e.target.value }))} />
        </div>
        <AdminField label={`Level (${newSkill.level}%)`}>
          <input type="range" min={0} max={100} value={newSkill.level} onChange={(e) => setNewSkill((n) => ({ ...n, level: Number(e.target.value) }))} style={{ width: '100%' }} />
        </AdminField>
        <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
          Add Skill
        </button>
      </form>

      {loading ? (
        <p className="admin-loading-line">Loading…</p>
      ) : (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>{category}</h3>
            {list.map((s, i) => (
              <div
                key={s.id}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--admin-border)',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <ReorderControls
                  canMoveUp={i > 0}
                  canMoveDown={i < list.length - 1}
                  onMoveUp={() => moveInList(list, i, -1)}
                  onMoveDown={() => moveInList(list, i, 1)}
                />
                {editingId === s.id ? (
                  <div>
                    <input className="admin-input" value={s.name} onChange={(e) => updateLocal(s.id, { name: e.target.value })} style={{ marginBottom: '0.35rem' }} />
                    <input className="admin-input" placeholder="Category" value={s.category ?? ''} onChange={(e) => updateLocal(s.id, { category: e.target.value })} />
                    <input type="range" min={0} max={100} value={s.level ?? 0} onChange={(e) => updateLocal(s.id, { level: Number(e.target.value) })} style={{ width: '100%', marginTop: '0.35rem' }} />
                  </div>
                ) : (
                  <button type="button" style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', padding: 0 }} onClick={() => setEditingId(s.id)}>
                    <strong>{s.name}</strong>
                    <div className="admin-skill-bar">
                      <div className="admin-skill-bar-fill" style={{ width: `${s.level ?? 0}%` }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--admin-muted)' }}>{s.level ?? 0}%</span>
                  </button>
                )}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {editingId === s.id && (
                    <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setEditingId(null)}>
                      Done
                    </button>
                  )}
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </>
  );
}
