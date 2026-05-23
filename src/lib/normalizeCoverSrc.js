/**
 * Normalize a project cover path/URL from the database.
 * Returns null for missing or blank values (never pass "" to <img src>).
 *
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeCoverSrc(value) {
  if (value == null) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  // Supabase Storage: ensure /object/public/ segment is present
  const storageWithoutPublic =
    /^https:\/\/([a-z0-9-]+)\.supabase\.co\/storage\/v1\/object\/(?!public\/)(.+)$/i;
  const storageMatch = trimmed.match(storageWithoutPublic);
  if (storageMatch) {
    return `https://${storageMatch[1]}.supabase.co/storage/v1/object/public/${storageMatch[2]}`;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  // Site-relative paths must be absolute from public/
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
