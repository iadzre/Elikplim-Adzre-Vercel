import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapProject } from '../lib/contentMappers';

/** @typedef {import('../lib/contentMappers').Project} Project */

export function useProjects() {
  const [projects, setProjects] = useState(/** @type {Project[]} */ ([]));
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
        .from('projects')
        .select(
          `
          id,
          title,
          subtitle,
          tag_left,
          tag_right,
          cover_src,
          cover_alt,
          media_type,
          sort_order,
          project_media ( src, sort_order )
        `
        )
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError);
        setProjects([]);
        setLoading(false);
        return;
      }

      setProjects((data || []).map(mapProject));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
