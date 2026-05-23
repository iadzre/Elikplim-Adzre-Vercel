import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getSession, isSupabaseConfigured, supabase } from '../../lib/supabase';
import '../../styles/admin.css';

export function ProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState(/** @type {'loading' | 'authed' | 'guest'} */ ('loading'));

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setState('guest');
      return;
    }

    let cancelled = false;

    getSession().then(({ data }) => {
      if (!cancelled) setState(data.session ? 'authed' : 'guest');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setState(session ? 'authed' : 'guest');
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (state === 'loading') {
    return (
      <div className="admin-root admin-loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  if (state === 'guest') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
