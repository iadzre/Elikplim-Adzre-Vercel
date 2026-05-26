import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminFeedback } from './AdminFeedback';
import { confirmAction } from '../../lib/adminUtils';

/**
 * @param {{ resourceId: string | null }} props
 */
export function AdminResourceFiles({ resourceId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const { data, error } = await supabase
      .from('resource_files')
      .select('*')
      .eq('resource_id', resourceId)
      .order('created_at', { ascending: false });
    if (error) {
      setFeedback({ type: 'error', message: error.message });
      setFiles([]);
      setLoading(false);
      return;
    }

    const rows = data ?? [];
    const withStatus = await Promise.all(
      rows.map(async (row) => {
        const { error: storageError } = await supabase.storage
          .from(row.storage_bucket || 'resource-files')
          .download(row.file_path);
        const missing =
          storageError && /not found|object not found/i.test(storageError.message ?? '');
        return { ...row, storageMissing: Boolean(missing) };
      })
    );
    setFiles(withStatus);
    setLoading(false);
  }

  useEffect(() => {
    if (!resourceId) return;
    setLoading(true);
    load();
  }, [resourceId]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !resourceId) return;
    setUploading(true);
    setFeedback(null);
    const path = `${resourceId}/1/${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const { error: upErr } = await uploadFile('resource-files', file, path);
    if (upErr) {
      setFeedback({ type: 'error', message: upErr.message });
      setUploading(false);
      return;
    }
    const { error } = await supabase.from('resource_files').insert({
      resource_id: resourceId,
      file_name: file.name,
      file_path: path,
      file_size: file.size,
      file_type: file.type,
      storage_bucket: 'resource-files',
      version: 1,
      is_primary: files.length === 0,
    });
    setUploading(false);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
    e.target.value = '';
  }

  async function handleDelete(fileId) {
    if (!confirmAction('Remove this file record? (Storage object may remain.)')) return;
    const { error } = await supabase.from('resource_files').delete().eq('id', fileId);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  if (!resourceId) {
    return (
      <section className="admin-shop-section admin-shop-downloads">
        <div className="admin-shop-section__head">
          <h2 className="admin-shop-section__title">Download file</h2>
          <p className="admin-shop-section__desc">Save the resource first, then upload the file visitors will download.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-shop-section admin-shop-downloads">
      <div className="admin-shop-section__head">
        <h2 className="admin-shop-section__title">Download file</h2>
        <p className="admin-shop-section__desc">The file customers receive when they download this resource.</p>
      </div>
      <div className="admin-shop-section__body">
        <AdminFeedback feedback={feedback} />
        <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : 'Upload download file'}
          <input type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
        {loading ? (
          <p className="admin-text-muted" style={{ marginTop: 'var(--admin-space-3)' }}>
            Loading files…
          </p>
        ) : files.length === 0 ? (
          <p className="admin-text-muted" style={{ marginTop: 'var(--admin-space-3)', fontSize: '0.8125rem' }}>
            No download file attached yet.
          </p>
        ) : (
          <ul className="admin-file-list">
            {files.map((f) => (
              <li key={f.id}>
                <span>
                  <strong>{f.file_name}</strong>
                  {f.is_primary && (
                    <span className="admin-badge admin-badge-published" style={{ marginLeft: '0.35rem' }}>
                      Primary
                    </span>
                  )}
                  {f.storageMissing && (
                    <span className="admin-badge admin-badge-pending" style={{ marginLeft: '0.35rem' }}>
                      Re-upload needed
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={() => handleDelete(f.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
