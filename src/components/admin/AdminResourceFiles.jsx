import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { uploadFile } from '../../lib/upload';
import { AdminFeedback } from './AdminFeedback';
import { confirmAction } from '../../lib/adminUtils';

/**
 * @param {{ resourceId: string }} props
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
          storageError &&
          /not found|object not found/i.test(storageError.message ?? '');
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
    const { url: _url, error: upErr } = await uploadFile('resource-files', file, path);
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

  async function handleDelete(id) {
    if (!confirmAction('Remove this file record? (Storage object may remain.)')) return;
    const { error } = await supabase.from('resource_files').delete().eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else load();
  }

  if (!resourceId) {
    return (
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.85rem' }}>Save the resource first to attach download files.</p>
    );
  }

  return (
    <div className="admin-card" style={{ marginTop: '1rem' }}>
      <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem' }}>Download files</h3>
      <AdminFeedback feedback={feedback} />
      <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ display: 'inline-block', cursor: 'pointer' }}>
        {uploading ? 'Uploading…' : 'Upload file'}
        <input type="file" hidden onChange={handleUpload} disabled={uploading} />
      </label>
      {loading ? (
        <p style={{ color: 'var(--admin-muted)', marginTop: '0.75rem' }}>Loading files…</p>
      ) : files.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)', marginTop: '0.75rem', fontSize: '0.85rem' }}>No files yet.</p>
      ) : (
        <ul style={{ margin: '0.75rem 0 0', padding: 0, listStyle: 'none' }}>
          {files.map((f) => (
            <li
              key={f.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderTop: '1px solid var(--admin-border)',
                fontSize: '0.85rem',
              }}
            >
              <span>
                {f.file_name}
                {f.is_primary && (
                  <span className="admin-badge admin-badge-published" style={{ marginLeft: '0.35rem' }}>
                    Primary
                  </span>
                )}
                {f.storageMissing && (
                  <span className="admin-badge admin-badge-draft" style={{ marginLeft: '0.35rem' }}>
                    Missing in storage — re-upload
                  </span>
                )}
              </span>
              <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(f.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
