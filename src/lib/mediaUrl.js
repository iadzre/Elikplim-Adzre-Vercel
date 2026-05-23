/**
 * Turn a public path (/images/...) or bundled asset URL into a browser-safe src.
 * Encodes path segments so filenames with spaces and special characters load correctly.
 *
 * @param {string | null | undefined} src
 * @returns {string}
 */
export function mediaUrl(src) {
  if (!src) return '';
  if (/^https?:\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const normalized = src.startsWith('/') ? src : `/${src}`;
  return normalized
    .split('/')
    .map((part, index) => (index === 0 ? part : encodeURIComponent(part)))
    .join('/');
}
