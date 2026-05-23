import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { FileDropzone } from '../../components/admin/FileDropzone';

const BG_TABS = [
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
  { id: 'color', label: 'Solid Color' },
  { id: 'gradient', label: 'Gradient' },
];

const GRADIENT_DIRS = [
  { value: 'to bottom', label: 'Top → Bottom' },
  { value: 'to right', label: 'Left → Right' },
  { value: '135deg', label: 'Diagonal' },
];

function parseGradient(value) {
  const m = value?.match(/linear-gradient\(([^,]+),\s*([^,]+),\s*([^)]+)\)/i);
  if (m) return { dir: m[1].trim(), start: m[2].trim(), end: m[3].trim() };
  return { dir: 'to bottom', start: '#1a1d27', end: '#6366f1' };
}

function buildGradient(dir, start, end) {
  return `linear-gradient(${dir}, ${start}, ${end})`;
}

function heroPreviewStyle(type, value) {
  if (type === 'color') return { background: value || '#1a1d27' };
  if (type === 'gradient') return { background: value || buildGradient('to bottom', '#1a1d27', '#6366f1') };
  if (type === 'video') {
    if (value?.includes('youtube.com') || value?.includes('youtu.be')) return { background: '#000' };
    return { background: '#000' };
  }
  if (value) return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
  return { background: '#242836' };
}

export function AdminHeroPage() {
  const [row, setRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [gradStart, setGradStart] = useState('#1a1d27');
  const [gradEnd, setGradEnd] = useState('#6366f1');
  const [gradDir, setGradDir] = useState('to bottom');

  useEffect(() => {
    document.title = 'Hero — CMS';
    supabase
      .from('hero')
      .select('*')
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setRow(data);
          if (data.background_type === 'gradient' && data.background_value) {
            const g = parseGradient(data.background_value);
            setGradStart(g.start);
            setGradEnd(g.end);
            setGradDir(g.dir);
          }
        } else {
          setRow({
            headline: '',
            subheadline: '',
            cta_text: '',
            cta_link: '',
            background_type: 'image',
            background_value: '',
            overlay_opacity: 0.5,
          });
        }
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

    let background_value = row.background_value;
    if (row.background_type === 'gradient') {
      background_value = buildGradient(gradDir, gradStart, gradEnd);
    }

    const payload = {
      headline: row.headline,
      subheadline: row.subheadline,
      cta_text: row.cta_text,
      cta_link: row.cta_link,
      background_type: row.background_type,
      background_value,
      overlay_opacity: Number(row.overlay_opacity) ?? 0.5,
    };

    let error;
    if (row.id) {
      ({ error } = await supabase.from('hero').update(payload).eq('id', row.id));
    } else {
      const { data, error: insErr } = await supabase.from('hero').insert(payload).select().single();
      error = insErr;
      if (data) setRow(data);
    }

    setSaving(false);
    setFeedback(error ? { type: 'error', message: error.message } : { type: 'success', message: 'Hero saved.' });
  }

  async function handleImageUpload(file) {
    setUploading(true);
    const { url, error } = await uploadFile('hero-backgrounds', file);
    setUploading(false);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (url) update('background_value', url);
  }

  async function handleVideoUpload(file) {
    setUploading(true);
    const { url, error } = await uploadFile('hero-backgrounds', file);
    setUploading(false);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (url) update('background_value', url);
  }

  if (loading || !row) return <p className="admin-loading-line">Loading…</p>;

  const opacity = Number(row.overlay_opacity ?? 0.5);
  const previewBg = heroPreviewStyle(row.background_type, row.background_type === 'gradient' ? buildGradient(gradDir, gradStart, gradEnd) : row.background_value);

  return (
    <>
      <AdminPageHeader title="Hero Section" />
      <AdminFeedback feedback={feedback} />

      <div className="admin-grid-2">
        <form className="admin-card" onSubmit={handleSave}>
          <AdminField label="Headline">
            <input className="admin-input" value={row.headline ?? ''} onChange={(e) => update('headline', e.target.value)} required />
          </AdminField>
          <AdminField label="Subheadline">
            <input className="admin-input" value={row.subheadline ?? ''} onChange={(e) => update('subheadline', e.target.value)} />
          </AdminField>
          <AdminField label="CTA button text">
            <input className="admin-input" value={row.cta_text ?? ''} onChange={(e) => update('cta_text', e.target.value)} />
          </AdminField>
          <AdminField label="CTA button link">
            <input className="admin-input" value={row.cta_link ?? ''} onChange={(e) => update('cta_link', e.target.value)} />
          </AdminField>

          <p className="admin-label">Background</p>
          <div className="admin-tabs">
            {BG_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab${row.background_type === tab.id ? ' active' : ''}`}
                onClick={() => update('background_type', tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {row.background_type === 'image' && (
            <>
              <FileDropzone accept="image/*" disabled={uploading} onFile={handleImageUpload} label={uploading ? 'Uploading…' : 'Upload background image'} />
              {row.background_value && (
                <img src={row.background_value} alt="" className="admin-thumb" style={{ width: '100%', height: 'auto', maxHeight: 120, marginTop: '0.5rem' }} />
              )}
              <AdminField label="Or image URL" hint="External URL or path">
                <input className="admin-input" value={row.background_value ?? ''} onChange={(e) => update('background_value', e.target.value)} />
              </AdminField>
            </>
          )}

          {row.background_type === 'video' && (
            <>
              <FileDropzone accept="video/mp4,video/*" disabled={uploading} onFile={handleVideoUpload} label={uploading ? 'Uploading…' : 'Upload MP4'} />
              <AdminField label="Video URL (YouTube, Vimeo, or direct MP4)">
                <input className="admin-input" value={row.background_value ?? ''} onChange={(e) => update('background_value', e.target.value)} />
              </AdminField>
            </>
          )}

          {row.background_type === 'color' && (
            <AdminField label="Background color">
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="color" value={row.background_value?.startsWith('#') ? row.background_value : '#1a1d27'} onChange={(e) => update('background_value', e.target.value)} />
                <input className="admin-input" value={row.background_value ?? '#1a1d27'} onChange={(e) => update('background_value', e.target.value)} />
              </div>
            </AdminField>
          )}

          {row.background_type === 'gradient' && (
            <>
              <div className="admin-grid-2">
                <AdminField label="Start color">
                  <input type="color" value={gradStart} onChange={(e) => setGradStart(e.target.value)} style={{ width: '100%', height: 36 }} />
                </AdminField>
                <AdminField label="End color">
                  <input type="color" value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} style={{ width: '100%', height: 36 }} />
                </AdminField>
              </div>
              <AdminField label="Direction">
                <select className="admin-select" value={gradDir} onChange={(e) => setGradDir(e.target.value)}>
                  {GRADIENT_DIRS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </AdminField>
            </>
          )}

          <AdminField label={`Overlay opacity (${Math.round(opacity * 100)}%)`}>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => update('overlay_opacity', e.target.value)}
              style={{ width: '100%' }}
            />
          </AdminField>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        <div className="admin-card">
          <p className="admin-label">Live preview</p>
          <div className="admin-preview-hero" style={previewBg}>
            <div className="admin-preview-overlay" style={{ opacity }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2>{row.headline || 'Headline'}</h2>
              <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>{row.subheadline || 'Subheadline'}</p>
              {row.cta_text && (
                <span className="admin-btn admin-btn-primary admin-btn-sm" style={{ marginTop: '1rem', display: 'inline-block' }}>
                  {row.cta_text}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
