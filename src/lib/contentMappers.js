/**
 * @typedef {'image' | 'video' | 'mixed'} ProjectMediaType
 */

import { normalizeCoverSrc } from './normalizeCoverSrc';

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} subtitle
 * @property {string} tagLeft
 * @property {string} tagRight
 * @property {string | null} coverSrc
 * @property {string} coverAlt
 * @property {ProjectMediaType} mediaType
 * @property {string[]} mediaSrcs
 */

/**
 * @typedef {Object} Testimonial
 * @property {string} id
 * @property {string} quote
 * @property {string} author
 * @property {string} role
 */

/**
 * @typedef {Object} HomeSlide
 * @property {string} id
 * @property {string} src
 * @property {string} alt
 */

/**
 * @typedef {Object} CareerTimelineEntry
 * @property {string} id
 * @property {'top' | 'bottom'} position
 * @property {string} left
 * @property {string} period
 * @property {string} title
 * @property {string} detail
 */

/**
 * @param {Record<string, unknown> & { project_media?: Array<{ src: string; sort_order: number }> }} row
 * @returns {Project}
 */
export function mapProject(row) {
  const media = [...(row.project_media || [])].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    tagLeft: row.tag_left,
    tagRight: row.tag_right,
    coverSrc: normalizeCoverSrc(row.cover_src),
    coverAlt: row.cover_alt,
    mediaType: row.media_type,
    mediaSrcs: media
      .map((m) => normalizeCoverSrc(m.src))
      .filter((src) => src != null),
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {Testimonial}
 */
export function mapTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {HomeSlide}
 */
export function mapHomeSlide(row) {
  return {
    id: row.id,
    src: normalizeCoverSrc(row.src) ?? '',
    alt: row.alt_text || '',
  };
}

/**
 * @param {Record<string, unknown>} row
 * @returns {CareerTimelineEntry}
 */
export function mapCareerTimelineEntry(row) {
  return {
    id: row.id,
    position: row.position,
    left: row.left_offset,
    period: row.period,
    title: row.title,
    detail: row.detail,
  };
}
