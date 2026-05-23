import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapCmsHeroSlide } from '../lib/cmsMappers';
import { mediaUrl } from '../lib/mediaUrl';

/**
 * @typedef {Object} HeroContent
 * @property {string} id
 * @property {string} headline
 * @property {string} subheadline
 * @property {string} ctaText
 * @property {string} ctaLink
 * @property {'image' | 'video' | 'color' | 'gradient'} backgroundType
 * @property {string} backgroundValue
 * @property {number} overlayOpacity
 * @property {{ id: string; src: string; alt: string }} slide
 */

export function useHero() {
  const [hero, setHero] = useState(/** @type {HeroContent | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.from('hero').select('*').limit(1).maybeSingle();

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setHero(null);
        setLoading(false);
        return;
      }

      if (!data) {
        setHero(null);
        setLoading(false);
        return;
      }

      const slide = mapCmsHeroSlide(data);
      setHero({
        id: String(data.id),
        headline: String(data.headline ?? ''),
        subheadline: String(data.subheadline ?? ''),
        ctaText: String(data.cta_text ?? ''),
        ctaLink: String(data.cta_link ?? ''),
        backgroundType: data.background_type || 'image',
        backgroundValue:
          data.background_type === 'color' || data.background_type === 'gradient'
            ? String(data.background_value ?? '')
            : data.background_value
              ? mediaUrl(String(data.background_value))
              : slide.src,
        overlayOpacity: Number(data.overlay_opacity ?? 0.5),
        slide,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { hero, loading, error };
}
