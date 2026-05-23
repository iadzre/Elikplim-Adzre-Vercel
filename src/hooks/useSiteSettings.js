import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapSiteSettings } from '../lib/cmsMappers';

const DEFAULTS = {
  site_title: 'Elikplim Adzre',
  meta_description: '',
  favicon_url: '/favicon.ico',
  footer_text: '',
  copyright_text: '',
  primary_color: '#2A2F7F',
  accent_color: '#F45D01',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.length) {
          setSettings({ ...DEFAULTS, ...mapSiteSettings(data) });
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
}
