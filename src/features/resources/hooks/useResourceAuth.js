import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { getAuthUser } from '../../../lib/services/resourcesService';

export function useResourceAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function sync() {
      const { user: u } = await getAuthUser();
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    }

    sync();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isSignedIn: Boolean(user) };
}
