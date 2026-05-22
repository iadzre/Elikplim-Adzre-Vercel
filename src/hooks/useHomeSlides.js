import { useEffect, useState } from 'react';
import { FALLBACK_HOME_SLIDES } from '../constants/fallbackContent';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapHomeSlide } from '../lib/contentMappers';

/** @typedef {import('../lib/contentMappers').HomeSlide} HomeSlide */

export function useHomeSlides() {
  const [slides, setSlides] = useState(/** @type {HomeSlide[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setUsingFallback(false);

      if (!isSupabaseConfigured()) {
        if (import.meta.env.DEV) {
          console.warn(
            '[useHomeSlides] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local — using static slides.'
          );
        }
        if (!cancelled) {
          setSlides(FALLBACK_HOME_SLIDES);
          setUsingFallback(true);
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('home_slides')
        .select('id, src, alt_text, sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        console.error('[useHomeSlides] Supabase error:', fetchError.message);
        setSlides(FALLBACK_HOME_SLIDES);
        setUsingFallback(true);
        setError(null);
        setLoading(false);
        return;
      }

      if (!data?.length) {
        if (import.meta.env.DEV) {
          console.warn('[useHomeSlides] home_slides is empty — run supabase/seed.sql. Using static slides.');
        }
        setSlides(FALLBACK_HOME_SLIDES);
        setUsingFallback(true);
        setLoading(false);
        return;
      }

      setSlides(data.map(mapHomeSlide));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { slides, loading, error, usingFallback };
}
