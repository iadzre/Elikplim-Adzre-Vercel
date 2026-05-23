import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapProject } from '../lib/contentMappers';
import { enrichCmsProjectsWithPortfolio } from '../lib/enrichCmsProjects';

/** @typedef {import('../lib/contentMappers').Project} Project */

const PORTFOLIO_SELECT = `
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

const PORTFOLIO_SELECT_NO_MEDIA = `
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

const CMS_SELECT = `
  id,
  title,
  description,
  cover_image_url,
  tags,
  display_order,
  status,
  media_type,
  project_gallery_items ( id, src, item_type, sort_order, alt_text )
`;

const CMS_SELECT_NO_GALLERY = `
  id,
  title,
  description,
  cover_image_url,
  tags,
  display_order,
  status,
  media_type
`;

async function loadPortfolioProjects() {
  let result = await supabase
    .from('portfolio_projects')
    .select(PORTFOLIO_SELECT)
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (result.error?.message?.includes('project_media')) {
    result = await supabase
      .from('portfolio_projects')
      .select(PORTFOLIO_SELECT_NO_MEDIA)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });
  }

  return result;
}

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

      let cmsResult = await supabase
        .from('projects')
        .select(CMS_SELECT)
        .eq('status', 'published')
        .order('display_order', { ascending: true });

      if (cmsResult.error?.message?.includes('project_gallery_items')) {
        cmsResult = await supabase
          .from('projects')
          .select(CMS_SELECT_NO_GALLERY)
          .eq('status', 'published')
          .order('display_order', { ascending: true });
      }

      const portfolioResult = await loadPortfolioProjects();

      if (cancelled) return;

      if (portfolioResult.error && !cmsResult.data?.length) {
        if (import.meta.env.DEV) {
          console.error('[useProjects]', portfolioResult.error.message);
        }
        setError(portfolioResult.error);
        setProjects([]);
        setLoading(false);
        return;
      }

      if (cmsResult.data?.length) {
        setProjects(
          enrichCmsProjectsWithPortfolio(cmsResult.data, portfolioResult.data || [])
        );
        setLoading(false);
        return;
      }

      if (portfolioResult.error) {
        setError(portfolioResult.error);
        setProjects([]);
      } else {
        setProjects((portfolioResult.data || []).map(mapProject));
      }
      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { projects, loading, error };
}
