import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { FileDropzone } from '../../components/admin/FileDropzone';
import { confirmAction, stringToTags, tagsToString } from '../../lib/adminUtils';

const empty = {
  title: '',
  description: '',
  long_description: '',
  cover_image_url: '',
  tags: [],
  live_url: '',
  github_url: '',
  featured: false,
  status: 'draft',
};

export function AdminProjectFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [tagsStr, setTagsStr] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    document.title = isNew ? 'New Project — CMS' : 'Edit Project — CMS';
    if (isNew) return;
    supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setFeedback({ type: 'error', message: error?.message ?? 'Project not found' });
        } else {
          setForm(data);
          setTagsStr(tagsToString(data.tags));
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload = {
      title: form.title,
      description: form.description,
      long_description: form.long_description,
      cover_image_url: form.cover_image_url,
      tags: stringToTags(tagsStr),
      live_url: form.live_url || null,
      github_url: form.github_url || null,
      featured: !!form.featured,
      status: form.status,
    };

    let error;
    if (isNew) {
      const { count } = await supabase.from('projects').select('id', { count: 'exact', head: true });
      const { error: insErr } = await supabase.from('projects').insert({ ...payload, display_order: count ?? 0 }).select().single();
      error = insErr;
      if (!error) navigate('/admin/projects');
    } else {
      ({ error } = await supabase.from('projects').update(payload).eq('id', id));
    }
    setSaving(false);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (!isNew) setFeedback({ type: 'success', message: 'Project saved.' });
  }

  async function handleDelete() {
    if (!confirmAction('Delete this project permanently?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else navigate('/admin/projects');
  }

  if (loading) return <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>;

  return (
    <>
      <h1 className="admin-page-title">{isNew ? 'New Project' : 'Edit Project'}</h1>
      <AdminFeedback feedback={feedback} />

      <form className="admin-card" onSubmit={handleSave} style={{ maxWidth: 720 }}>
        <AdminField label="Title">
          <input className="admin-input" value={form.title} onChange={(e) => update('title', e.target.value)} required />
        </AdminField>
        <AdminField label="Short description">
          <textarea className="admin-textarea" rows={3} value={form.description ?? ''} onChange={(e) => update('description', e.target.value)} />
        </AdminField>
        <AdminField label="Long description">
          <textarea className="admin-textarea" rows={8} value={form.long_description ?? ''} onChange={(e) => update('long_description', e.target.value)} />
        </AdminField>

        <AdminField label="Cover image">
          <FileDropzone
            accept="image/*"
            onFile={async (file) => {
              const { url, error } = await uploadFile('project-covers', file);
              if (error) setFeedback({ type: 'error', message: error.message });
              else if (url) update('cover_image_url', url);
            }}
          />
          {form.cover_image_url && <img src={form.cover_image_url} alt="" style={{ marginTop: '0.5rem', maxHeight: 120, borderRadius: 6 }} />}
        </AdminField>

        <AdminField label="Tags (comma-separated)">
          <input className="admin-input" value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} placeholder="Design, Film, Photography" />
        </AdminField>

        <AdminField label="Live URL">
          <input className="admin-input" type="url" value={form.live_url ?? ''} onChange={(e) => update('live_url', e.target.value)} placeholder="https://" />
        </AdminField>
        <AdminField label="GitHub URL">
          <input className="admin-input" type="url" value={form.github_url ?? ''} onChange={(e) => update('github_url', e.target.value)} placeholder="https://github.com/..." />
        </AdminField>

        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!form.featured} onChange={(e) => update('featured', e.target.checked)} />
            <span className="admin-label" style={{ margin: 0 }}>
              Featured on homepage
            </span>
          </label>
        </div>

        <AdminField label="Status">
          <select className="admin-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </AdminField>

        <div className="admin-actions-row">
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <Link to="/admin/projects" className="admin-btn admin-btn-secondary">
            Cancel
          </Link>
          {!isNew && (
            <button type="button" className="admin-btn admin-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </form>
    </>
  );
}
