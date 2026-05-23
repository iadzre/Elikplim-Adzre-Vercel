import { useEffect } from 'react';
import { useSiteSettings } from './useSiteSettings';

/**
 * @param {string} [suffix]
 */
export function usePageTitle(suffix) {
  const { settings, loading } = useSiteSettings();

  useEffect(() => {
    if (loading) return;
    const base = settings.site_title || 'Elikplim Adzre';
    document.title = suffix ? `${base} - ${suffix}` : base;
  }, [settings.site_title, suffix, loading]);
}
