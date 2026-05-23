/**
 * Normalize a project cover path/URL from the database.
 * Returns null for missing or blank values (never pass "" to <img src>).
 */

import { LEGACY_MEDIA_URL_MAP } from '../constants/storageMediaUrls';

/**
 * @param {unknown} value
 * @returns {string | null}
 */
export function normalizeCoverSrc(value) {
  if (value == null) return null;

  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const storageWithoutPublic =
    /^https:\/\/([a-z0-9-]+)\.supabase\.co\/storage\/v1\/object\/(?!public\/)(.+)$/i;
  const storageMatch = trimmed.match(storageWithoutPublic);
  if (storageMatch) {
    return `https://${storageMatch[1]}.supabase.co/storage/v1/object/public/${storageMatch[2]}`;
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  const legacy = LEGACY_MEDIA_URL_MAP[trimmed];
  if (legacy) return legacy;

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}
