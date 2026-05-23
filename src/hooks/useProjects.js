import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapProject } from '../lib/contentMappers';

/** @typedef {import('../lib/contentMappers').Project} Project */

const PROJECT_SELECT = `
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
`;

const PROJECT_SELECT_NO_MEDIA = `
  id,
  title,
  subtitle,
  tag_left,
  tag_right,
  cover_src,
  cover_alt,
  media_type,
  sort_order
`;

export function useProjects() {
  const [projects, setProjects] = useState(/** @type {Project[]} */ ([]));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(/** @type {Error | null} */ (null));

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setError(
        new Error(
          'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local (local) or Vercel Environment Variables (production), then restart the dev server or redeploy.'
        )
      );
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      let result = await supabase
        .from('portfolio_projects')
        .select(PROJECT_SELECT)
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (result.error?.message?.includes('project_media')) {
        result = await supabase
          .from('portfolio_projects')
          .select(PROJECT_SELECT_NO_MEDIA)
          .eq('is_published', true)
          .order('sort_order', { ascending: true });
      }

      if (cancelled) return;

      if (result.error) {
        if (import.meta.env.DEV) {
          console.error('[useProjects]', result.error.message);
        }
        setError(result.error);
        setProjects([]);
        setLoading(false);
        return;
      }

      setProjects((result.data || []).map(mapProject));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
