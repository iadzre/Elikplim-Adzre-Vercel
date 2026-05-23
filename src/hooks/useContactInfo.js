import { useSiteData } from '../context/SiteDataContext';

export function useContactInfo() {
  const { contactEntries, loading } = useSiteData();

  function findByPlatform(platform) {
    return contactEntries.find((e) => e.platform.toLowerCase() === platform.toLowerCase());
  }

  return { entries: contactEntries, loading, findByPlatform };
}
