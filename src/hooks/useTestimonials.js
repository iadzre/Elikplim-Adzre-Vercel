import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapCmsTestimonial } from '../lib/cmsMappers';
import { mapTestimonial } from '../lib/contentMappers';

/** @typedef {import('../lib/contentMappers').Testimonial} Testimonial */

export function useTestimonials() {
  const [testimonials, setTestimonials] = useState(/** @type {Testimonial[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError(new Error('Supabase is not configured'));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const [cmsResult, legacyResult] = await Promise.all([
        supabase
          .from('testimonials')
          .select('id, content, author_name, author_title, display_order')
          .eq('status', 'approved')
          .order('display_order', { ascending: true }),
        supabase
          .from('portfolio_testimonials')
          .select('id, quote, author, role, sort_order')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
      ]);

      if (cancelled) return;

      if (cmsResult.data?.length) {
        setTestimonials(cmsResult.data.map(mapCmsTestimonial));
        setLoading(false);
        return;
      }

      if (legacyResult.error) {
        setError(legacyResult.error);
        setTestimonials([]);
      } else {
        setTestimonials((legacyResult.data || []).map(mapTestimonial));
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { testimonials, loading, error };
}
