import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapCareerTimelineEntry } from '../lib/contentMappers';

/** @typedef {import('../lib/contentMappers').CareerTimelineEntry} CareerTimelineEntry */

export function useCareerTimeline() {
  const [entries, setEntries] = useState(/** @type {CareerTimelineEntry[]} */ ([]));
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
        .from('career_timeline_entries')
        .select('id, position, left_offset, period, title, detail, sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setEntries([]);
        setLoading(false);
        return;
      }

      setEntries((data || []).map(mapCareerTimelineEntry));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { entries, loading, error };
}
