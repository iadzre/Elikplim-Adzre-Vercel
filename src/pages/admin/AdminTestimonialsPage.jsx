import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { FileDropzone } from '../../components/admin/FileDropzone';
import { ReorderControls, swapOrder } from '../../components/admin/ReorderControls';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { confirmAction, formatDate } from '../../lib/adminUtils';

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

const emptyForm = {
  author_name: '',
  author_title: '',
  author_image_url: '',
  content: '',
  rating: 5,
  status: 'approved',
};

export function AdminTestimonialsPage() {
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [dragId, setDragId] = useState(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('status', tab)
      .order('display_order', { ascending: true });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Testimonials — CMS';
    load();
  }, [tab]);

  async function setStatus(id, status) {
    const { error } = await supabase.from('testimonials').update({ status }).eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  async function handleDelete(id) {
    if (!confirmAction('Delete this testimonial?')) return;
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(t) {
    setEditId(t.id);
    setForm({
      author_name: t.author_name,
      author_title: t.author_title ?? '',
      author_image_url: t.author_image_url ?? '',
      content: t.content,
      rating: t.rating ?? 5,
      status: t.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      author_name: form.author_name,
      author_title: form.author_title || null,
      author_image_url: form.author_image_url || null,
      content: form.content,
      rating: form.rating,
      status: form.status,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from('testimonials').update(payload).eq('id', editId));
    } else {
      const { count } = await supabase.from('testimonials').select('id', { count: 'exact', head: true });
      ({ error } = await supabase.from('testimonials').insert({ ...payload, display_order: count ?? 0 }));
    }
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setModalOpen(false);
      load();
    }
  }

  async function move(index, dir) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const err = await swapOrder(supabase, 'testimonials', items[index], items[j]);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  async function handleDrop(targetId) {
    if (!dragId || dragId === targetId) return;
    const from = items.find((t) => t.id === dragId);
    const to = items.find((t) => t.id === targetId);
    if (!from || !to) return;
    const err = await swapOrder(supabase, 'testimonials', from, to);
    setDragId(null);
    if (err) setFeedback({ type: 'error', message: err.message });
    else load();
  }

  return (
    <>
      <AdminPageHeader title="Testimonials">
        <button type="button" className="admin-btn admin-btn-primary" onClick={openAdd}>
          Add Testimonial
        </button>
      </AdminPageHeader>
      <AdminFeedback feedback={feedback} />

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.id} type="button" className={`admin-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-loading-line">Loading…</p>
      ) : items.length === 0 ? (
        <p className="admin-text-muted">No {tab} testimonials.</p>
      ) : (
        items.map((t, i) => (
          <div
            key={t.id}
            className="admin-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => tab === 'approved' && handleDrop(t.id)}
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {tab === 'approved' && (
                <ReorderControls
                  draggable
                  onDragStart={() => setDragId(t.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(t.id)}
                  canMoveUp={i > 0}
                  canMoveDown={i < items.length - 1}
                  onMoveUp={() => move(i, -1)}
                  onMoveDown={() => move(i, 1)}
                />
              )}
              {t.author_image_url ? (
                <img src={t.author_image_url} alt="" className="admin-thumb" style={{ borderRadius: '50%' }} />
              ) : (
                <div className="admin-thumb" style={{ borderRadius: '50%' }} />
              )}
              <div style={{ flex: 1 }}>
                <strong>{t.author_name}</strong>
                {t.author_title && <span style={{ color: 'var(--admin-muted)', marginLeft: '0.5rem' }}>{t.author_title}</span>}
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{t.content}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--admin-muted)', margin: 0 }}>
                  {'★'.repeat(t.rating ?? 5)} · {formatDate(t.created_at)}
                </p>
              </div>
            </div>
            <div className="admin-actions-row">
              {tab === 'pending' && (
                <>
                  <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setStatus(t.id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setStatus(t.id, 'rejected')}>
                    Reject
                  </button>
                </>
              )}
              {tab === 'rejected' && (
                <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setStatus(t.id, 'approved')}>
                  Approve
                </button>
              )}
              {tab === 'approved' && (
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setStatus(t.id, 'pending')}>
                  Unapprove
                </button>
              )}
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(t)}>
                Edit
              </button>
              <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(t.id)}>
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)} role="presentation">
          <form className="admin-modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
            <AdminField label="Author name">
              <input className="admin-input" value={form.author_name} onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))} required />
            </AdminField>
            <AdminField label="Title / role">
              <input className="admin-input" value={form.author_title} onChange={(e) => setForm((f) => ({ ...f, author_title: e.target.value }))} />
            </AdminField>
            <AdminField label="Avatar">
              <FileDropzone
                accept="image/*"
                onFile={async (file) => {
                  const { url, error } = await uploadFile('testimonial-avatars', file);
                  if (error) setFeedback({ type: 'error', message: error.message });
                  else if (url) setForm((f) => ({ ...f, author_image_url: url }));
                }}
              />
              {form.author_image_url && <img src={form.author_image_url} alt="" className="admin-thumb" style={{ marginTop: '0.5rem', borderRadius: '50%' }} />}
            </AdminField>
            <AdminField label="Comment" hint="Leave a blank line between paragraphs to split the testimonial into multiple paragraphs.">
              <textarea className="admin-textarea" rows={6} value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} required />
            </AdminField>
            <AdminField label={`Rating (${form.rating} stars)`}>
              <input type="range" min={1} max={5} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} style={{ width: '100%' }} />
            </AdminField>
            {!editId && (
              <AdminField label="Status">
                <select className="admin-select" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </AdminField>
            )}
            <div className="admin-actions-row">
              <button type="submit" className="admin-btn admin-btn-primary">
                Save
              </button>
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
