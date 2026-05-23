import { supabase } from './supabase';

/** @typedef {'hero-backgrounds' | 'project-covers' | 'project-gallery' | 'profile-images' | 'testimonial-avatars'} CmsBucket */

/**
 * Upload a file to a CMS storage bucket and return its public URL.
 *
 * @param {CmsBucket} bucket
 * @param {File} file
 * @param {string} [path] Optional path inside the bucket (defaults to timestamped filename)
 * @returns {Promise<{ url: string | null, error: Error | null }>}
 */
export async function uploadFile(bucket, file, path) {
  if (!supabase) {
    return { url: null, error: new Error('Supabase is not configured') };
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, '_');
  const objectPath = path ?? `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (uploadError) {
    return { url: null, error: uploadError };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return { url: data.publicUrl, error: null };
}
