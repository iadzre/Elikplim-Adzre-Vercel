import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminField } from './AdminField';
import { ReorderControls, swapOrder } from './ReorderControls';
import { ProjectCover } from '../projects/ProjectCover';
import { normalizeCoverSrc } from '../../lib/normalizeCoverSrc';
import { itemTypeFromFilename } from '../../lib/projectMediaUtils';
import { confirmAction } from '../../lib/adminUtils';

/**
 * @param {{
 *   projectId: string | undefined;
 *   mediaType: string;
 *   onMediaTypeChange: (value: string) => void;
 *   onFeedback: (feedback: { type: 'success' | 'error'; message: string } | null) => void;
 * }} props
 */
export function AdminProjectGallery({ projectId, mediaType, onMediaTypeChange, onFeedback }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pathInput, setPathInput] = useState('');
  const [itemType, setItemType] = useState('image');

  const load = useCallback(async () => {
    if (!projectId) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('project_gallery_items')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) {
      onFeedback({ type: 'error', message: error.message });
      setItems([]);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }, [projectId, onFeedback]);

  useEffect(() => {
    load();
  }, [load]);

  async function persistOrder(nextItems) {
    setSaving(true);
    const results = await Promise.all(
      nextItems.map((item, index) =>
        supabase
          .from('project_gallery_items')
          .update({ sort_order: index })
          .eq('id', item.id)
      )
    );
    const err = results.find((r) => r.error)?.error;
    setSaving(false);
    if (err) onFeedback({ type: 'error', message: err.message });
    else await load();
  }

  async function handleAddPath(e) {
    e.preventDefault();
    if (!projectId || !pathInput.trim()) return;

    const src = pathInput.trim();
    const type = itemType || itemTypeFromFilename(src);
    const { error } = await supabase.from('project_gallery_items').insert({
      project_id: projectId,
      src,
      item_type: type,
      sort_order: items.length,
      alt_text: null,
    });

    if (error) onFeedback({ type: 'error', message: error.message });
    else {
      setPathInput('');
      onFeedback({ type: 'success', message: 'Gallery item added.' });
      await load();
    }
  }

  async function handleUpload(file) {
    if (!projectId) return;
    const { url, error } = await uploadFile('project-gallery', file, `${projectId}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`);
    if (error) {
      onFeedback({ type: 'error', message: error.message });
      return;
    }
    if (!url) return;

    const type = itemTypeFromFilename(file.name);
    const { error: insErr } = await supabase.from('project_gallery_items').insert({
      project_id: projectId,
      src: url,
      item_type: type,
      sort_order: items.length,
    });

    if (insErr) onFeedback({ type: 'error', message: insErr.message });
    else {
      onFeedback({ type: 'success', message: 'File uploaded to gallery.' });
      await load();
    }
  }

  async function handleDelete(itemId) {
    if (!confirmAction('Remove this gallery item?')) return;
    const { error } = await supabase.from('project_gallery_items').delete().eq('id', itemId);
    if (error) onFeedback({ type: 'error', message: error.message });
    else await load();
  }

  function move(index, delta) {
    const next = swapOrder(items, index, index + delta).map((item, i) => ({ ...item, sort_order: i }));
    setItems(next);
    persistOrder(next);
  }

  if (!projectId) {
    return (
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
        Save the project first, then add gallery images and videos for the modal viewer.
      </p>
    );
  }

  return (
    <div className="admin-gallery-editor">
      <AdminField label="Gallery mode (modal viewer)">
        <select
          className="admin-select"
          value={mediaType || 'image'}
          onChange={(e) => onMediaTypeChange(e.target.value)}
        >
          <option value="image">Images only</option>
          <option value="video">Videos only</option>
          <option value="mixed">Mixed images &amp; videos</option>
        </select>
      </AdminField>

      <form onSubmit={handleAddPath} style={{ marginBottom: '1rem' }}>
        <AdminField label="Add by path or URL">
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              className="admin-input"
              style={{ flex: '1 1 200px' }}
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              placeholder="/images/Prj01/example.jpg"
            />
            <select
              className="admin-select"
              style={{ width: 'auto' }}
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <button type="submit" className="admin-btn admin-btn-secondary admin-btn-sm">
              Add
            </button>
          </div>
        </AdminField>
      </form>

      <AdminField label="Upload file">
        <input
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime,.mov"
          className="admin-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = '';
          }}
        />
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.8rem', marginTop: '0.35rem' }}>
          Large videos can be added as paths under <code>/images/...</code> instead of uploading.
        </p>
      </AdminField>

      {loading ? (
        <p style={{ color: 'var(--admin-muted)' }}>Loading gallery…</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem' }}>
          No gallery items yet. The cover image is used when the gallery is empty.
        </p>
      ) : (
        <ul className="admin-gallery-list">
          {items.map((item, index) => (
            <li key={item.id} className="admin-gallery-item">
              <ReorderControls
                canMoveUp={index > 0}
                canMoveDown={index < items.length - 1}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
              />
              <div className="admin-gallery-item-preview">
                {item.item_type === 'video' ? (
                  <div className="admin-gallery-video-badge">VIDEO</div>
                ) : (
                  <ProjectCover
                    title={item.alt_text || 'Gallery'}
                    coverSrc={normalizeCoverSrc(item.src)}
                    className="admin-thumb"
                  />
                )}
              </div>
              <div className="admin-gallery-item-meta">
                <span className="admin-badge">{item.item_type}</span>
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{item.src}</code>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost admin-btn-sm"
                onClick={() => handleDelete(item.id)}
                disabled={saving}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
