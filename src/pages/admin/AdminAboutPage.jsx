import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { FileDropzone } from '../../components/admin/FileDropzone';

export function AdminAboutPage() {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    document.title = 'About — CMS';
    supabase
      .from('about')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setRow(
          data ?? {
            name: '',
            title: '',
            bio: '',
            profile_image_url: '',
            cv_url: '',
            email: '',
            phone: '',
            location: '',
          }
        );
        setLoading(false);
      });
  }, []);

  function update(field, value) {
    setRow((r) => ({ ...r, [field]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const payload = {
      name: row.name,
      title: row.title,
      bio: row.bio,
      profile_image_url: row.profile_image_url,
      cv_url: row.cv_url,
      email: row.email,
      phone: row.phone,
      location: row.location,
    };
    let error;
    if (row.id) {
      ({ error } = await supabase.from('about').update(payload).eq('id', row.id));
    } else {
      const { data, error: insErr } = await supabase.from('about').insert(payload).select().single();
      error = insErr;
      if (data) setRow(data);
    }
    setSaving(false);
    setFeedback(error ? { type: 'error', message: error.message } : { type: 'success', message: 'About section saved.' });
  }

  if (loading || !row) return <p className="admin-loading-line">Loading…</p>;

  const cvName = row.cv_url ? row.cv_url.split('/').pop() : null;

  return (
    <>
      <h1 className="admin-page-title">About / Bio</h1>
      <AdminFeedback feedback={feedback} />

      <form className="admin-card" onSubmit={handleSave} style={{ maxWidth: 640 }}>
        <AdminField label="Full name">
          <input className="admin-input" value={row.name ?? ''} onChange={(e) => update('name', e.target.value)} required />
        </AdminField>
        <AdminField label="Professional title / tagline">
          <input className="admin-input" value={row.title ?? ''} onChange={(e) => update('title', e.target.value)} />
        </AdminField>
        <AdminField label="Bio">
          <textarea className="admin-textarea" value={row.bio ?? ''} onChange={(e) => update('bio', e.target.value)} rows={6} />
        </AdminField>

        <AdminField label="Profile photo">
          <FileDropzone
            accept="image/*"
            onFile={async (file) => {
              const { url, error } = await uploadFile('profile-images', file, `profile-${Date.now()}-${file.name}`);
              if (error) setFeedback({ type: 'error', message: error.message });
              else if (url) update('profile_image_url', url);
            }}
          />
          {row.profile_image_url && (
            <img src={row.profile_image_url} alt="" style={{ marginTop: '0.5rem', maxWidth: 120, borderRadius: 8 }} />
          )}
        </AdminField>

        <AdminField label="CV / Resume (PDF)">
          <FileDropzone
            accept="application/pdf"
            label="Upload PDF resume"
            onFile={async (file) => {
              const { url, error } = await uploadFile('profile-images', file, `cv-${Date.now()}-${file.name}`);
              if (error) setFeedback({ type: 'error', message: error.message });
              else if (url) update('cv_url', url);
            }}
          />
          {cvName && <p style={{ fontSize: '0.8rem', color: 'var(--admin-muted)', marginTop: '0.35rem' }}>Current: {cvName}</p>}
        </AdminField>

        <AdminField label="Email">
          <input type="email" className="admin-input" value={row.email ?? ''} onChange={(e) => update('email', e.target.value)} />
        </AdminField>
        <AdminField label="Phone">
          <input className="admin-input" value={row.phone ?? ''} onChange={(e) => update('phone', e.target.value)} />
        </AdminField>
        <AdminField label="Location">
          <input className="admin-input" value={row.location ?? ''} onChange={(e) => update('location', e.target.value)} />
        </AdminField>

        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  );
}
