import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { FileDropzone } from '../../components/admin/FileDropzone';
import { AdminResourceFiles } from '../../components/admin/AdminResourceFiles';
import { confirmAction, slugify, stringToTags, tagsToString } from '../../lib/adminUtils';

const empty = {
  slug: '',
  title: '',
  short_description: '',
  full_description: '',
  thumbnail_url: '',
  preview_images: [],
  preview_video_url: '',
  category_id: '',
  pricing_type: 'free',
  price: 0,
  compare_at_price: '',
  featured: false,
  status: 'draft',
  file_formats: [],
  compatibility: [],
  license_type: 'standard',
  tags: [],
  seo_title: '',
  seo_description: '',
};

export function AdminShopResourceFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [tagsStr, setTagsStr] = useState('');
  const [formatsStr, setFormatsStr] = useState('');
  const [compatStr, setCompatStr] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [resourceId, setResourceId] = useState(isNew ? null : id);

  useEffect(() => {
    document.title = isNew ? 'New Resource — Shop CMS' : 'Edit Resource — Shop CMS';
    supabase
      .from('resource_categories')
      .select('id, name, slug')
      .order('display_order', { ascending: true })
      .then(({ data }) => setCategories(data ?? []));

    if (isNew) return;
    supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          setFeedback({ type: 'error', message: error?.message ?? 'Resource not found' });
        } else {
          setForm({
            ...data,
            compare_at_price: data.compare_at_price ?? '',
            category_id: data.category_id ?? '',
          });
          setTagsStr(tagsToString(data.tags));
          setFormatsStr(tagsToString(data.file_formats));
          setCompatStr(tagsToString(data.compatibility));
          setResourceId(data.id);
        }
        setLoading(false);
      });
  }, [id, isNew]);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      if (field === 'title' && isNew && !f.slug) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const { data: session } = await supabase.auth.getSession();
    const uid = session?.session?.user?.id ?? null;

    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      short_description: form.short_description,
      full_description: form.full_description,
      thumbnail_url: form.thumbnail_url || null,
      preview_images: form.preview_images ?? [],
      preview_video_url: form.preview_video_url || null,
      category_id: form.category_id || null,
      creator_id: uid,
      pricing_type: form.pricing_type,
      price: form.pricing_type === 'free' ? 0 : Number(form.price) || 0,
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      featured: !!form.featured,
      status: form.status,
      file_formats: stringToTags(formatsStr),
      compatibility: stringToTags(compatStr),
      license_type: form.license_type || 'standard',
      tags: stringToTags(tagsStr),
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };

    let error;
    if (isNew) {
      const { data: created, error: insErr } = await supabase
        .from('resources')
        .insert(payload)
        .select('id')
        .single();
      error = insErr;
      if (!error && created?.id) {
        setResourceId(created.id);
        navigate(`/admin/shop/resources/${created.id}`, { replace: true });
      }
    } else {
      ({ error } = await supabase.from('resources').update(payload).eq('id', id));
    }

    setSaving(false);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (!isNew) setFeedback({ type: 'success', message: 'Resource saved.' });
  }

  async function handleDelete() {
    if (!confirmAction('Delete this resource permanently?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else navigate('/admin/shop/resources');
  }

  async function uploadThumbnail(file) {
    const rid = resourceId ?? 'draft';
    const path = `${rid}/thumb-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const { url, error } = await uploadFile('resource-previews', file, path);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (url) update('thumbnail_url', url);
  }

  async function uploadPreview(file) {
    const rid = resourceId ?? 'draft';
    const path = `${rid}/preview-${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const { url, error } = await uploadFile('resource-previews', file, path);
    if (error) setFeedback({ type: 'error', message: error.message });
    else if (url) update('preview_images', [...(form.preview_images ?? []), url]);
  }

  if (loading) return <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>;

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/admin/shop/resources" className="admin-btn admin-btn-ghost admin-btn-sm">
          ← Resources
        </Link>
      </div>
      <h1 className="admin-page-title">{isNew ? 'New resource' : 'Edit resource'}</h1>
      <AdminFeedback feedback={feedback} />

      <form onSubmit={handleSave} className="admin-card">
        <div className="admin-grid-2">
          <AdminField label="Title" required>
            <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </AdminField>
          <AdminField label="Slug" required>
            <input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} required />
          </AdminField>
        </div>

        <AdminField label="Short description">
          <textarea rows={2} value={form.short_description ?? ''} onChange={(e) => update('short_description', e.target.value)} />
        </AdminField>
        <AdminField label="Full description">
          <textarea rows={4} value={form.full_description ?? ''} onChange={(e) => update('full_description', e.target.value)} />
        </AdminField>

        <div className="admin-grid-2">
          <AdminField label="Category">
            <select value={form.category_id ?? ''} onChange={(e) => update('category_id', e.target.value)}>
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </AdminField>
          <AdminField label="License">
            <input value={form.license_type ?? ''} onChange={(e) => update('license_type', e.target.value)} />
          </AdminField>
        </div>

        <div className="admin-grid-2">
          <AdminField label="Pricing">
            <select value={form.pricing_type} onChange={(e) => update('pricing_type', e.target.value)}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </AdminField>
          <AdminField label="Price (USD)">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              disabled={form.pricing_type === 'free'}
              onChange={(e) => update('price', e.target.value)}
            />
          </AdminField>
          <AdminField label="Compare at">
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.compare_at_price}
              onChange={(e) => update('compare_at_price', e.target.value)}
            />
          </AdminField>
        </div>

        <div className="admin-grid-2">
          <AdminField label="Status">
            <select value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </AdminField>
          <AdminField label="Options">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input type="checkbox" checked={!!form.featured} onChange={(e) => update('featured', e.target.checked)} />
              Featured on shop
            </label>
          </AdminField>
        </div>

        <AdminField label="Tags (comma-separated)">
          <input value={tagsStr} onChange={(e) => setTagsStr(e.target.value)} />
        </AdminField>
        <div className="admin-grid-2">
          <AdminField label="File formats">
            <input value={formatsStr} onChange={(e) => setFormatsStr(e.target.value)} placeholder="Figma, ZIP, PDF" />
          </AdminField>
          <AdminField label="Compatibility">
            <input value={compatStr} onChange={(e) => setCompatStr(e.target.value)} />
          </AdminField>
        </div>

        <AdminField label="Thumbnail">
          <FileDropzone accept="image/*" onFile={uploadThumbnail} />
          {form.thumbnail_url && (
            <img src={form.thumbnail_url} alt="" style={{ maxWidth: 160, marginTop: '0.5rem', borderRadius: 4 }} />
          )}
        </AdminField>

        <AdminField label="Gallery previews">
          <FileDropzone accept="image/*" onFile={uploadPreview} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {(form.preview_images ?? []).map((url) => (
              <div key={url} style={{ position: 'relative' }}>
                <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 4 }} />
                <button
                  type="button"
                  className="admin-btn admin-btn-danger admin-btn-sm"
                  style={{ position: 'absolute', top: 2, right: 2, padding: '0 0.35rem' }}
                  onClick={() => update('preview_images', form.preview_images.filter((u) => u !== url))}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </AdminField>

        <div className="admin-grid-2">
          <AdminField label="SEO title">
            <input value={form.seo_title ?? ''} onChange={(e) => update('seo_title', e.target.value)} />
          </AdminField>
          <AdminField label="SEO description">
            <input value={form.seo_description ?? ''} onChange={(e) => update('seo_description', e.target.value)} />
          </AdminField>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
          <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {!isNew && (
            <button type="button" className="admin-btn admin-btn-danger" onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </form>

      <AdminResourceFiles resourceId={resourceId} />
    </>
  );
}
