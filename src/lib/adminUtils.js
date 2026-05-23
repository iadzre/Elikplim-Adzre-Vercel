/** @param {string | null | undefined} iso */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * @param {string} message
 * @returns {boolean}
 */
export function confirmAction(message) {
  return window.confirm(message);
}

/** @param {string[] | null | undefined} tags */
export function tagsToString(tags) {
  if (!tags?.length) return '';
  return tags.join(', ');
}

/** @param {string} str */
export function stringToTags(str) {
  return str
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** @param {string} str */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
