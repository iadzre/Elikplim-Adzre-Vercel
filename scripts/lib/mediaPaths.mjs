const IMAGE_EXT = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.JPG',
  '.JPEG',
  '.PNG',
  '.WEBP',
  '.GIF',
]);

const VIDEO_EXT = new Set(['.mp4', '.mov', '.webm', '.avi', '.m4v', '.MP4', '.MOV', '.WEBM']);

const COVER_NAMES = new Set(['cover.jpg', 'Cover.jpg', 'cover.png', 'Cover.png', 'cover.webp']);

/**
 * @param {string} name
 */
export function fileExtension(name) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i) : '';
}

/**
 * @param {string} name
 */
export function isImageFile(name) {
  return IMAGE_EXT.has(fileExtension(name));
}

/**
 * @param {string} name
 */
export function isVideoFile(name) {
  return VIDEO_EXT.has(fileExtension(name));
}

/**
 * Relative path under public/images, e.g. "slider/_DSF2248.jpg"
 * @param {string} relativePath
 */
export function resolveBucket(relativePath) {
  const parts = relativePath.split('/');
  const folder = parts[0];
  const fileName = parts[parts.length - 1];

  if (folder === 'slider') return 'hero-backgrounds';
  if (COVER_NAMES.has(fileName)) return 'project-covers';
  return 'project-gallery';
}

/**
 * @param {string} relativePath e.g. slider/_DSF2248.jpg
 * @param {'webp' | 'original'} outputKind
 */
export function storageObjectPath(relativePath, outputKind = 'webp') {
  const normalized = relativePath.replace(/\\/g, '/');
  if (outputKind === 'original') {
    return `legacy/${normalized}`;
  }

  const dot = normalized.lastIndexOf('.');
  const withoutExt = dot >= 0 ? normalized.slice(0, dot) : normalized;
  return `legacy/${withoutExt}.webp`;
}

/**
 * @param {string} relativePath
 */
export function compressionProfile(relativePath) {
  const bucket = resolveBucket(relativePath);
  if (bucket === 'hero-backgrounds') {
    return { maxWidth: 1920, quality: 82 };
  }
  if (bucket === 'project-covers') {
    return { maxWidth: 1400, quality: 80 };
  }
  return { maxWidth: 1920, quality: 78 };
}

/**
 * @param {string} localPath e.g. /images/slider/foo.jpg
 */
export function toLegacyDbPath(localPath) {
  const trimmed = localPath.trim();
  if (trimmed.startsWith('/images/')) return trimmed;
  if (trimmed.startsWith('images/')) return `/${trimmed}`;
  return `/images/${trimmed.replace(/^\/+/, '')}`;
}

/**
 * @param {string} value
 */
export function sqlEscape(value) {
  return String(value).replace(/'/g, "''");
}
