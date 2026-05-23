import { useEffect, useState } from 'react';
import { FALLBACK_HOME_SLIDES } from '../constants/fallbackContent';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapHomeSlide } from '../lib/contentMappers';
import { normalizeCoverSrc } from '../lib/normalizeCoverSrc';
/** @typedef {import('../lib/contentMappers').HomeSlide} HomeSlide */

/**
 * @typedef {Object} HeroOverlay
 * @property {string} headline
 * @property {string} subheadline
 * @property {string} ctaText
 * @property {string} ctaLink
 * @property {number} overlayOpacity
 */

/**
 * @param {HomeSlide[]} slides
 * @param {Record<string, unknown> | null} heroRow
 */
function applyHeroToSlides(slides, heroRow) {
  if (!heroRow) return slides;

  const type = heroRow.background_type;
  const rawValue = heroRow.background_value ? String(heroRow.background_value) : '';
  if (!rawValue || (type !== 'image' && type !== 'video')) return slides;

  const heroSrc = normalizeCoverSrc(rawValue);
  if (!heroSrc) return slides;

  const heroSlide = {
    id: `hero-${heroRow.id}`,
    src: heroSrc,
    alt: String(heroRow.headline ?? 'Hero'),
  };

  if (!slides.length) return [heroSlide];

  return [{ ...slides[0], src: heroSrc, alt: heroSlide.alt }, ...slides.slice(1)];
}

/**
 * @param {Record<string, unknown> | null} heroRow
 * @returns {HeroOverlay | null}
 */
function mapHeroOverlay(heroRow) {
  if (!heroRow) return null;

  return {
    headline: String(heroRow.headline ?? ''),
    subheadline: String(heroRow.subheadline ?? ''),
    ctaText: String(heroRow.cta_text ?? ''),
    ctaLink: String(heroRow.cta_link ?? ''),
    overlayOpacity: Number(heroRow.overlay_opacity ?? 0.5),
  };
}

export function useHomeSlides() {
  const [slides, setSlides] = useState(FALLBACK_HOME_SLIDES);
  const [hero, setHero] = useState(/** @type {HeroOverlay | null} */ (null));
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState(/** @type {Error | null} */ (null));
  const [usingFallback, setUsingFallback] = useState(!isSupabaseConfigured());

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isSupabaseConfigured()) {
        if (import.meta.env.DEV) {
          console.warn(
            '[useHomeSlides] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — using static slides.'
          );
        }
        return;
      }

      setError(null);

      const [slidesResult, heroResult] = await Promise.all([
        supabase
          .from('home_slides')
          .select('id, src, alt_text, sort_order')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('hero')
          .select(
            'id, headline, subheadline, cta_text, cta_link, background_type, background_value, overlay_opacity'
          )
          .limit(1)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      if (slidesResult.error) {
        console.error('[useHomeSlides] Supabase error:', slidesResult.error.message);
        setSlides(FALLBACK_HOME_SLIDES);
        setHero(mapHeroOverlay(heroResult.data));
        setUsingFallback(true);
        setError(null);
        setLoading(false);
        return;
      }

      let nextSlides = (slidesResult.data || []).map(mapHomeSlide);
      nextSlides = applyHeroToSlides(nextSlides, heroResult.data);
      const nextHero = mapHeroOverlay(heroResult.data);

      if (!nextSlides.length) {
        if (import.meta.env.DEV) {
          console.warn('[useHomeSlides] No slides — using static fallback.');
        }
        setSlides(FALLBACK_HOME_SLIDES);
        setHero(nextHero);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      setSlides(nextSlides);
      setHero(nextHero);
      setUsingFallback(false);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { slides, hero, loading, error, usingFallback };
}
