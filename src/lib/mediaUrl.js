import { LEGACY_MEDIA_URL_MAP } from '../constants/storageMediaUrls';

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

  const legacyMapped = LEGACY_MEDIA_URL_MAP[trimmed] || LEGACY_MEDIA_URL_MAP[`/${trimmed.replace(/^\//, '')}`];
  if (legacyMapped) return legacyMapped;

  const normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return normalized
    .split('/')
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join('/');
}

/**
 * Resolve /images/… paths to Supabase URLs when migration map is populated.
 * @param {string} src
 */
export function resolveLegacyStoragePath(src) {
  if (!src.startsWith('/images/')) return null;
  return LEGACY_MEDIA_URL_MAP[src] || null;
}
