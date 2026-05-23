import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mapNavLinks } from '../lib/cmsMappers';

const FALLBACK_NAV = [
  { id: 'about', label: 'About Me', href: '/about' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'note', label: 'Leave a Note', href: '/leave-a-note' },
];

export function useNavLinks() {
  const [links, setLinks] = useState(FALLBACK_NAV);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from('nav_links')
      .select('id, label, href')
      .eq('visible', true)
      .order('display_order', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error && data?.length) {
          setLinks(mapNavLinks(data));
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { links, loading };
}
