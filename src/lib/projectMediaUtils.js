const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];

/**
 * @param {string} src
 * @returns {boolean}
 */
export function isVideoSrc(src) {
  const lower = String(src || '').toLowerCase().split('?')[0];
  return VIDEO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * @param {'image' | 'video' | 'mixed' | string | null | undefined} explicit
 * @param {Array<{ item_type?: string; src?: string }>} galleryItems
 * @param {string[]} mediaSrcs
 * @returns {'image' | 'video' | 'mixed'}
 */
export function deriveProjectMediaType(explicit, galleryItems, mediaSrcs) {
  if (explicit === 'image' || explicit === 'video' || explicit === 'mixed') {
    return explicit;
  }

  const sources = [
    ...galleryItems.map((item) => ({
      type: item.item_type,
      src: item.src,
    })),
    ...mediaSrcs.map((src) => ({ type: isVideoSrc(src) ? 'video' : 'image', src })),
  ];

  let hasImage = false;
  let hasVideo = false;

  for (const item of sources) {
    if (item.type === 'video' || isVideoSrc(item.src)) hasVideo = true;
    else hasImage = true;
  }

  if (hasVideo && hasImage) return 'mixed';
  if (hasVideo) return 'video';
  return 'image';
}

/**
 * @param {string} filename
 * @returns {'image' | 'video'}
 */
export function itemTypeFromFilename(filename) {
  return isVideoSrc(filename) ? 'video' : 'image';
}
