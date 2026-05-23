import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapContactInfo } from '../lib/cmsMappers';

export function useContactInfo() {
  const [entries, setEntries] = useState(/** @type {ReturnType<typeof mapContactInfo>} */ ([]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from('contact_info')
      .select('*')
      .eq('visible', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.length) {
          setEntries(mapContactInfo(data));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function findByPlatform(platform) {
    return entries.find((e) => e.platform.toLowerCase() === platform.toLowerCase());
  }

  return { entries, loading, findByPlatform };
}
