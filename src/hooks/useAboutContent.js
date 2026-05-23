import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapCmsAbout, mapCmsSkills } from '../lib/cmsMappers';

const DEFAULT_NAME = 'Elikplim Adzre';
const DEFAULT_TITLE = 'Illustrator | Filmmaker | Photographer | Storyteller';

export function useAboutContent() {
  const [bioParagraphs, setBioParagraphs] = useState(/** @type {string[]} */ ([]));
  const [skills, setSkills] = useState(/** @type {string[]} */ ([]));
  const [name, setName] = useState(DEFAULT_NAME);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [profileImageUrl, setProfileImageUrl] = useState(/** @type {string | null} */ (null));
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

      const [aboutResult, skillsCmsResult, bioLegacyResult, skillsLegacyResult] =
        await Promise.all([
          supabase.from('about').select('*').limit(1).maybeSingle(),
          supabase.from('skills').select('name, display_order').order('display_order', { ascending: true }),
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

      const fetchError =
        aboutResult.error ||
        skillsCmsResult.error ||
        bioLegacyResult.error ||
        skillsLegacyResult.error;

      if (fetchError) {
        setError(fetchError);
        setBioParagraphs([]);
        setSkills([]);
        setLoading(false);
        return;
      }

      const legacyBio = (bioLegacyResult.data || []).map((row) => row.body);
      const legacySkills = (skillsLegacyResult.data || []).map((row) => row.label);
      const cmsAbout = mapCmsAbout(aboutResult.data);

      if (cmsAbout) {
        setName(cmsAbout.name || DEFAULT_NAME);
        setTitle(cmsAbout.title || DEFAULT_TITLE);
        setProfileImageUrl(cmsAbout.profileImageUrl);
        setBioParagraphs(
          cmsAbout.bioParagraphs.length ? cmsAbout.bioParagraphs : legacyBio
        );
      } else {
        setName(DEFAULT_NAME);
        setTitle(DEFAULT_TITLE);
        setProfileImageUrl(null);
        setBioParagraphs(legacyBio);
      }

      const cmsSkills = mapCmsSkills(skillsCmsResult.data || []);
      setSkills(cmsSkills.length ? cmsSkills : legacySkills);
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { bioParagraphs, skills, name, title, profileImageUrl, loading, error };
}
