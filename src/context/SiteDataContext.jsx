import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapSiteSettings, mapNavLinks, mapContactInfo } from '../lib/cmsMappers';

const DEFAULT_SETTINGS = {
  site_title: 'Elikplim Adzre',
  meta_description: '',
  favicon_url: '/favicon.ico',
  footer_text: '',
  copyright_text: '',
  primary_color: '#2A2F7F',
  accent_color: '#F45D01',
};

const FALLBACK_NAV = [
  { id: 'about', label: 'About Me', href: '/about' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'note', label: 'Leave a Note', href: '/leave-a-note' },
];

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [navLinks, setNavLinks] = useState(FALLBACK_NAV);
  const [contactEntries, setContactEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const [settingsResult, navResult, contactResult] = await Promise.all([
        supabase.from('site_settings').select('key, value'),
        supabase
          .from('nav_links')
          .select('id, label, href')
          .eq('visible', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('contact_info')
          .select('*')
          .eq('visible', true)
          .order('display_order', { ascending: true }),
      ]);

      if (cancelled) return;

      if (settingsResult.data?.length) {
        setSettings({ ...DEFAULT_SETTINGS, ...mapSiteSettings(settingsResult.data) });
      }
      if (!navResult.error && navResult.data?.length) {
        setNavLinks(mapNavLinks(navResult.data));
      }
      if (!contactResult.error && contactResult.data?.length) {
        setContactEntries(mapContactInfo(contactResult.data));
      }

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      settings,
      navLinks,
      contactEntries,
      loading,
    }),
    [settings, navLinks, contactEntries, loading]
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
}

export function useSiteData() {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return context;
}
