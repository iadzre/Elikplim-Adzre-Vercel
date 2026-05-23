/**
 * Turn a public path (/images/...) or bundled asset URL into a browser-safe src.
 * Encodes path segments so filenames with spaces and special characters load correctly.
 *
 * @param {string | null | undefined} src
 * @returns {string}
 */
export function mediaUrl(src) {
  if (!src || !String(src).trim()) return '';
  const trimmed = String(src).trim();

  const storageWithoutPublic =
    /^https:\/\/([a-z0-9-]+)\.supabase\.co\/storage\/v1\/object\/(?!public\/)(.+)$/i;
  const storageMatch = trimmed.match(storageWithoutPublic);
  if (storageMatch) {
    return `https://${storageMatch[1]}.supabase.co/storage/v1/object/public/${storageMatch[2]}`;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return normalized
    .split('/')
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join('/');
}
