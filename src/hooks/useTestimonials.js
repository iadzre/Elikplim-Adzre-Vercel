import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

      const { data, error: fetchError } = await supabase
        .from('testimonials')
        .select('id, quote, author, role, sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setTestimonials([]);
        setLoading(false);
        return;
      }

      setTestimonials((data || []).map(mapTestimonial));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { testimonials, loading, error };
}
