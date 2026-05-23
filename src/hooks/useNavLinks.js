import { useSiteData } from '../context/SiteDataContext';

export function useNavLinks() {
  const { navLinks, loading } = useSiteData();
  return { links: navLinks, loading };
}
