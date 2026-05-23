import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';

const KEYS = [
  { key: 'site_title', label: 'Site title', hint: 'Used in document title and SEO' },
  { key: 'meta_description', label: 'Meta description', textarea: true },
  { key: 'favicon_url', label: 'Favicon URL' },
  { key: 'footer_text', label: 'Footer tagline', textarea: true },
  { key: 'copyright_text', label: 'Copyright line' },
  { key: 'primary_color', label: 'Primary color', color: true },
  { key: 'accent_color', label: 'Accent color', color: true },
];

export function AdminSettingsPage() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    document.title = 'Settings — CMS';
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        const map = {};
        (data ?? []).forEach((r) => {
          map[r.key] = r.value ?? '';
        });
        KEYS.forEach((k) => {
          if (map[k.key] === undefined) map[k.key] = '';
        });
        setValues(map);
        setLoading(false);
      });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const rows = KEYS.map((k) => ({ key: k.key, value: values[k.key] ?? '' }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    setFeedback(error ? { type: 'error', message: error.message } : { type: 'success', message: 'Settings saved.' });
  }

  if (loading) return <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>;

  return (
    <>
      <h1 className="admin-page-title">Site Settings</h1>
      <AdminFeedback feedback={feedback} />

      <form className="admin-card" onSubmit={handleSave} style={{ maxWidth: 560 }}>
        {KEYS.map((k) => (
          <AdminField key={k.key} label={k.label} hint={k.hint}>
            {k.textarea ? (
              <textarea
                className="admin-textarea"
                value={values[k.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
              />
            ) : k.color ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="color"
                  value={values[k.key]?.startsWith('#') ? values[k.key] : '#000000'}
                  onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
                />
                <input
                  className="admin-input"
                  value={values[k.key] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
                />
              </div>
            ) : (
              <input
                className="admin-input"
                value={values[k.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [k.key]: e.target.value }))}
              />
            )}
          </AdminField>
        ))}
        <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  );
}
