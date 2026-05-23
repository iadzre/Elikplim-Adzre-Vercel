import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export function useAboutContent() {
  const [bioParagraphs, setBioParagraphs] = useState(/** @type {string[]} */ ([]));
  const [skills, setSkills] = useState(/** @type {string[]} */ ([]));
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

      const [bioResult, skillsResult] = await Promise.all([
        supabase
          .from('about_bio_paragraphs')
          .select('body, sort_order')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
        supabase
          .from('portfolio_skills')
          .select('label, sort_order')
          .eq('is_published', true)
          .order('sort_order', { ascending: true }),
      ]);

      if (cancelled) return;

      if (bioResult.error || skillsResult.error) {
        setError(bioResult.error || skillsResult.error);
        setBioParagraphs([]);
        setSkills([]);
        setLoading(false);
        return;
      }

      setBioParagraphs((bioResult.data || []).map((row) => row.body));
      setSkills((skillsResult.data || []).map((row) => row.label));
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { bioParagraphs, skills, loading, error };
}
