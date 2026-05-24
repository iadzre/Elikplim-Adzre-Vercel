/**
 * @param {number | string | null | undefined} rating
 * @param {number | string | null | undefined} ratingCount
 */
export function formatResourceRating(rating, ratingCount) {
  const count = Number(ratingCount) || 0;
  if (count <= 0) return null;

  const value = Number(rating);
  if (!Number.isFinite(value) || value <= 0) return null;

  return `${value.toFixed(1)} ★ (${count.toLocaleString()})`;
}

/**
 * @param {number | string | null | undefined} downloadCount
 */
export function formatResourceDownloads(downloadCount) {
  const count = Math.max(0, Number(downloadCount) || 0);
  if (count === 1) return '1 download';
  return `${count.toLocaleString()} downloads`;
}

/**
 * @param {{ rating?: number; ratingCount?: number; downloadCount?: number }} resource
 */
export function formatResourceStatsLine(resource) {
  const parts = [];
  const ratingLabel = formatResourceRating(resource.rating, resource.ratingCount);
  if (ratingLabel) parts.push(ratingLabel);
  parts.push(formatResourceDownloads(resource.downloadCount));
  return parts.join(' · ');
}
