import { getSupabaseAdmin, getSupabaseAnon, getSupabaseUserClient } from './_lib/supabaseAdmin.js';

async function storageObjectExists(admin, bucket, filePath) {
  const { error } = await admin.storage.from(bucket).download(filePath);
  if (!error) return true;
  const msg = (error.message ?? '').toLowerCase();
  if (msg.includes('not found') || msg.includes('object not found')) return false;
  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resourceId, sessionId } = req.body ?? {};
    if (!resourceId) {
      return res.status(400).json({ error: 'resourceId is required' });
    }

    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const supabaseUser = token ? getSupabaseUserClient(token) : getSupabaseAnon();

    const { data: canAccess, error: accessError } = await supabaseUser.rpc('user_can_access_resource', {
      p_resource_id: resourceId,
    });
    if (accessError) {
      return res.status(500).json({ error: accessError.message });
    }
    if (!canAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: files, error: filesError } = await supabaseUser.rpc('get_downloadable_files', {
      p_resource_id: resourceId,
    });
    if (filesError) {
      return res.status(500).json({ error: filesError.message });
    }
    if (!files?.length) {
      return res.status(404).json({
        error: 'No download file is attached to this resource. Upload one in Admin → Shop.',
      });
    }

    const file = files[0];
    const admin = getSupabaseAdmin();
    const exists = await storageObjectExists(admin, file.storage_bucket, file.file_path);
    if (!exists) {
      return res.status(404).json({
        error:
          'This file is not in storage yet. In Admin → Shop, open the resource and upload the download file.',
      });
    }

    const { data: signed, error: signError } = await admin.storage
      .from(file.storage_bucket)
      .createSignedUrl(file.file_path, 120, { download: file.file_name });

    if (signError || !signed?.signedUrl) {
      return res.status(500).json({ error: signError?.message ?? 'Could not create download link' });
    }

    const { error: logError } = await supabaseUser.rpc('record_resource_download', {
      p_resource_id: resourceId,
      p_resource_file_id: file.file_id,
      p_session_id: sessionId ?? null,
    });
    if (logError) {
      console.error('record_resource_download', logError);
    }

    return res.status(200).json({
      signedUrl: signed.signedUrl,
      file: {
        file_id: file.file_id,
        file_name: file.file_name,
        file_path: file.file_path,
        storage_bucket: file.storage_bucket,
      },
    });
  } catch (err) {
    console.error('download-resource', err);
    return res.status(500).json({ error: err.message ?? 'Download failed' });
  }
}
