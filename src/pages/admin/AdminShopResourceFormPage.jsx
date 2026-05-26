import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from '../../components/admin/AdminField';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { FileDropzone } from '../../components/admin/FileDropzone';
import { AdminResourceFiles } from '../../components/admin/AdminResourceFiles';
import { confirmAction, slugify, stringToTags, tagsToString } from '../../lib/adminUtils';
import { ensureMyShopProfile } from '../../lib/shop/ensureProfile';
import '../../styles/admin-shop-resource.css';

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

function statusBadgeClass(status) {
  if (status === 'published') return 'admin-badge-published';
  if (status === 'archived') return 'admin-badge-archived';
  return 'admin-badge-draft';
}

function statusLabel(status) {
  if (status === 'published') return 'Published';
  if (status === 'archived') return 'Archived';
  return 'Draft';
}

/**
 * @param {{ title: string; description?: string; children: import('react').ReactNode }} props
 */
function FormSection({ title, description, children }) {
  return (
    <section className="admin-shop-section">
      <div className="admin-shop-section__head">
        <h2 className="admin-shop-section__title">{title}</h2>
        {description ? <p className="admin-shop-section__desc">{description}</p> : null}
      </div>
      <div className="admin-shop-section__body">{children}</div>
    </section>
  );
}

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
    document.title = isNew ? 'New resource — Shop' : 'Edit resource — Shop';
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

    const { profileId, error: profileError } = await ensureMyShopProfile();
    if (profileError) {
      setSaving(false);
      setFeedback({ type: 'error', message: profileError.message });
      return;
    }

    const payload = {
      slug: form.slug || slugify(form.title),
      title: form.title,
      short_description: form.short_description,
      full_description: form.full_description,
      thumbnail_url: form.thumbnail_url || null,
      preview_images: form.preview_images ?? [],
      preview_video_url: form.preview_video_url || null,
      category_id: form.category_id || null,
      creator_id: profileId,
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
    else setFeedback({ type: 'success', message: isNew ? 'Resource created.' : 'Changes saved.' });
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

  if (loading) {
    return <p className="admin-loading-line">Loading resource…</p>;
  }

  const displaySlug = form.slug || slugify(form.title) || '…';

  return (
    <div className="admin-shop-resource">
      <header className="admin-shop-header">
        <div className="admin-shop-header__main">
          <Link to="/admin/shop/resources" className="admin-shop-header__nav">
            ← Back to resources
          </Link>
          <div className="admin-shop-header__title-row">
            <h1 className="admin-shop-header__title">{isNew ? 'New resource' : form.title || 'Edit resource'}</h1>
            <span className={`admin-badge ${statusBadgeClass(form.status)}`}>{statusLabel(form.status)}</span>
            {form.featured && <span className="admin-badge admin-badge-featured">Featured</span>}
          </div>
          <p className="admin-shop-header__slug">/resources/{displaySlug}</p>
        </div>
        <div className="admin-shop-header__actions">
          {!isNew && (
            <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={handleDelete}>
              Delete
            </button>
          )}
          <button type="submit" form="shop-resource-form" className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isNew ? 'Create resource' : 'Save changes'}
          </button>
        </div>
      </header>

      <AdminFeedback feedback={feedback} />

      <form id="shop-resource-form" onSubmit={handleSave}>
        <div className="admin-shop-layout">
          <div className="admin-shop-main">
            <FormSection title="Basics" description="Name and URL shown on the resources page.">
              <AdminField label="Title" hint="Shown on the shop card and detail modal.">
                <input
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                  placeholder="e.g. Cinematic UI Kit"
                />
              </AdminField>
              <AdminField label="URL slug" hint="Lowercase, hyphenated. Auto-filled from title for new resources.">
                <input
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => update('slug', slugify(e.target.value))}
                  required
                  placeholder="cinematic-ui-kit"
                />
              </AdminField>
            </FormSection>

            <FormSection title="Description" description="Short line for cards; full text in the detail view.">
              <AdminField label="Short description">
                <textarea
                  className="admin-textarea"
                  rows={2}
                  value={form.short_description ?? ''}
                  onChange={(e) => update('short_description', e.target.value)}
                  placeholder="One sentence summary"
                />
              </AdminField>
              <AdminField label="Full description">
                <textarea
                  className="admin-textarea"
                  rows={5}
                  value={form.full_description ?? ''}
                  onChange={(e) => update('full_description', e.target.value)}
                  placeholder="What’s included, how to use it, etc."
                />
              </AdminField>
            </FormSection>

            <FormSection title="Listing details" description="Category, tags, and file metadata.">
              <div className="admin-form-grid">
                <AdminField label="Category">
                  <select
                    className="admin-select"
                    value={form.category_id ?? ''}
                    onChange={(e) => update('category_id', e.target.value)}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </AdminField>
                <AdminField label="License">
                  <input
                    className="admin-input"
                    value={form.license_type ?? ''}
                    onChange={(e) => update('license_type', e.target.value)}
                    placeholder="commercial"
                  />
                </AdminField>
              </div>
              <AdminField label="Tags" hint="Comma-separated">
                <input
                  className="admin-input"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="Figma, Web, SaaS"
                />
              </AdminField>
              <div className="admin-form-grid">
                <AdminField label="File formats" hint="Comma-separated">
                  <input
                    className="admin-input"
                    value={formatsStr}
                    onChange={(e) => setFormatsStr(e.target.value)}
                    placeholder="Figma, PDF"
                  />
                </AdminField>
                <AdminField label="Compatibility" hint="Comma-separated">
                  <input
                    className="admin-input"
                    value={compatStr}
                    onChange={(e) => setCompatStr(e.target.value)}
                    placeholder="Figma 116+"
                  />
                </AdminField>
              </div>
            </FormSection>

            <FormSection title="Gallery" description="Extra preview images in the resource modal.">
              <FileDropzone accept="image/*" onFile={uploadPreview} />
              {(form.preview_images ?? []).length > 0 && (
                <div className="admin-shop-thumb-grid">
                  {(form.preview_images ?? []).map((url) => (
                    <div key={url} className="admin-shop-thumb">
                      <img src={url} alt="" />
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger admin-btn-sm admin-shop-thumb__remove"
                        onClick={() => update('preview_images', form.preview_images.filter((u) => u !== url))}
                        aria-label="Remove preview"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            <FormSection title="SEO" description="Optional overrides for search and social previews.">
              <div className="admin-form-grid">
                <AdminField label="SEO title">
                  <input
                    className="admin-input"
                    value={form.seo_title ?? ''}
                    onChange={(e) => update('seo_title', e.target.value)}
                    placeholder={form.title || 'Defaults to resource title'}
                  />
                </AdminField>
                <AdminField label="SEO description">
                  <input
                    className="admin-input"
                    value={form.seo_description ?? ''}
                    onChange={(e) => update('seo_description', e.target.value)}
                    placeholder="Short meta description"
                  />
                </AdminField>
              </div>
            </FormSection>
          </div>

          <aside className="admin-shop-aside">
            <section className="admin-shop-section">
              <div className="admin-shop-section__head">
                <h2 className="admin-shop-section__title">Cover image</h2>
              </div>
              <div className="admin-shop-preview">
                <div className="admin-shop-preview__frame">
                  {form.thumbnail_url ? (
                    <img src={form.thumbnail_url} alt="" />
                  ) : (
                    <p className="admin-shop-preview__empty">No cover yet</p>
                  )}
                </div>
                <div className="admin-shop-preview__drop">
                  <FileDropzone accept="image/*" onFile={uploadThumbnail} />
                </div>
              </div>
            </section>

            <section className="admin-shop-section">
              <div className="admin-shop-section__head">
                <h2 className="admin-shop-section__title">Visibility</h2>
              </div>
              <div className="admin-shop-section__body">
                <AdminField label="Status">
                  <select
                    className="admin-select"
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                  >
                    <option value="draft">Draft — hidden from shop</option>
                    <option value="published">Published — live on site</option>
                    <option value="archived">Archived — hidden</option>
                  </select>
                </AdminField>
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={!!form.featured}
                    onChange={(e) => update('featured', e.target.checked)}
                  />
                  Feature on resources page
                </label>
              </div>
            </section>

            <section className="admin-shop-section">
              <div className="admin-shop-section__head">
                <h2 className="admin-shop-section__title">Pricing</h2>
              </div>
              <div className="admin-shop-section__body">
                <div className="admin-shop-pills" role="group" aria-label="Pricing type">
                  <button
                    type="button"
                    className={`admin-shop-pill${form.pricing_type === 'free' ? ' is-active' : ''}`}
                    onClick={() => update('pricing_type', 'free')}
                  >
                    Free
                  </button>
                  <button
                    type="button"
                    className={`admin-shop-pill${form.pricing_type === 'paid' ? ' is-active' : ''}`}
                    onClick={() => update('pricing_type', 'paid')}
                  >
                    Paid
                  </button>
                </div>
                <div className={`admin-shop-price-row${form.pricing_type === 'free' ? ' is-disabled' : ''}`}>
                  <AdminField label="Price (USD)">
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      disabled={form.pricing_type === 'free'}
                      onChange={(e) => update('price', e.target.value)}
                    />
                  </AdminField>
                  <AdminField label="Compare at (USD)" hint="Optional strike price">
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.compare_at_price}
                      disabled={form.pricing_type === 'free'}
                      onChange={(e) => update('compare_at_price', e.target.value)}
                    />
                  </AdminField>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </form>

      <div className="admin-shop-downloads">
        <AdminResourceFiles resourceId={resourceId} />
      </div>
    </div>
  );
}
