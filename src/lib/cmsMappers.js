import { mediaUrl } from './mediaUrl';
import { normalizeCoverSrc } from './normalizeCoverSrc';

/**
 * @param {Record<string, unknown>} row
 * @returns {import('./contentMappers').Project}
 */
export function mapCmsProject(row) {
  const tags = /** @type {string[] | null} */ (row.tags) || [];
  const cover = normalizeCoverSrc(row.cover_image_url);

  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    subtitle: String(row.description ?? ''),
    tagLeft: tags[0] ?? '',
    tagRight: tags[1] ?? '',
    coverSrc: cover,
    coverAlt: String(row.title ?? 'Project cover'),
    mediaType: 'image',
    mediaSrcs: cover ? [cover] : [],
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {import('./contentMappers').Testimonial}
 */
export function mapCmsTestimonial(row) {
  return {
    id: String(row.id),
    quote: String(row.content ?? ''),
    author: String(row.author_name ?? ''),
    role: String(row.author_title ?? ''),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {{ id: string; src: string; alt: string }}
 */
export function mapCmsHeroSlide(row) {
  const type = row.background_type;
  const value = String(row.background_value ?? '');
  let src = value;

  if (type === 'image' && value) {
    src = mediaUrl(value);
  } else if (type === 'video' && value && !value.includes('youtube') && !value.includes('vimeo')) {
    src = mediaUrl(value);
  }

  return {
    id: String(row.id),
    src: src || mediaUrl('/images/slider/_DSF2248.jpg'),
    alt: String(row.headline ?? 'Hero'),
  };
}

/**
 * @param {Record<string, unknown> | null} row
 */
export function mapCmsAbout(row) {
  if (!row) return null;
  const bio = String(row.bio ?? '');
  return {
    name: String(row.name ?? ''),
    title: String(row.title ?? ''),
    bioParagraphs: bio.split(/\n\n+|\n/).map((p) => p.trim()).filter(Boolean),
    profileImageUrl: row.profile_image_url ? mediaUrl(String(row.profile_image_url)) : null,
    cvUrl: row.cv_url ? String(row.cv_url) : null,
    email: row.email ? String(row.email) : null,
    phone: row.phone ? String(row.phone) : null,
    location: row.location ? String(row.location) : null,
  };
}

/**
 * @param {Array<Record<string, unknown>>} rows
 */
export function mapCmsSkills(rows) {
  return rows.map((r) => String(r.name ?? '')).filter(Boolean);
}

/**
 * @param {Array<{ key: string; value: string | null }>} rows
 */
export function mapSiteSettings(rows) {
  /** @type {Record<string, string>} */
  const map = {};
  rows.forEach((r) => {
    map[r.key] = r.value ?? '';
  });
  return map;
}

/**
 * @param {Array<Record<string, unknown>>} rows
 */
export function mapNavLinks(rows) {
  return rows.map((r) => ({
    id: String(r.id),
    label: String(r.label ?? ''),
    href: String(r.href ?? '/'),
  }));
}

/**
 * @param {Array<Record<string, unknown>>} rows
 */
export function mapContactInfo(rows) {
  return rows.map((r) => ({
    id: String(r.id),
    platform: String(r.platform ?? ''),
    label: String(r.label ?? r.platform ?? ''),
    value: String(r.value ?? ''),
    icon: r.icon ? String(r.icon) : '',
  }));
}
