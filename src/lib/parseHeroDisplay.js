/**
 * Map CMS hero fields to editorial layout layers (Primland-inspired).
 * Eyebrow is optional — derived from subheadline when possible, without DB changes.
 *
 * Explicit CMS format in subheadline: "STRONG|soft::descriptor text"
 * Auto format: "Word · word · …" (2+ segments) → eyebrow from first two parts.
 *
 * @param {{ headline?: string, subheadline?: string, ctaText?: string, ctaLink?: string } | null} hero
 */
export function parseHeroDisplay(hero) {
  if (!hero?.headline?.trim()) return null;

  const sub = (hero.subheadline || '').trim();
  let eyebrowStrong = null;
  let eyebrowSoft = null;
  let descriptor = sub;

  const explicit = sub.match(/^([^|]+)\|([^|]+)::([\s\S]+)$/);
  if (explicit) {
    eyebrowStrong = explicit[1].trim();
    eyebrowSoft = explicit[2].trim();
    descriptor = explicit[3].trim();
  } else {
    const parts = sub.split('·').map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      eyebrowStrong = parts[0].toUpperCase();
      eyebrowSoft = parts[1].toLowerCase();
    }
  }

  return {
    eyebrowStrong,
    eyebrowSoft,
    showEyebrow: Boolean(eyebrowStrong && eyebrowSoft),
    headline: hero.headline.trim(),
    descriptor,
    ctaText: hero.ctaText?.trim() || '',
    ctaLink: hero.ctaLink?.trim() || '',
  };
}

/**
 * @param {string} headline
 */
export function splitHeadlineLines(headline) {
  return headline.split(/\n+/).map((line) => line.trim()).filter(Boolean);
}
