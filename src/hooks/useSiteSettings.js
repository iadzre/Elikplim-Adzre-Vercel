import { useSiteData } from '../context/SiteDataContext';

export function useSiteSettings() {
  const { settings, loading } = useSiteData();
  return { settings, loading };
}
