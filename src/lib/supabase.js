import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (
  import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL
)?.trim();
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)?.trim();

/**
 * Supabase client — anon key + RLS. Auth session persisted for CMS admin routes from supabase/migrations/.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

/**
 * @param {string} email
 * @param {string} password
 */
export async function signIn(email, password) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase is not configured') };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) {
    return { error: new Error('Supabase is not configured') };
  }
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) {
    return { data: { session: null }, error: new Error('Supabase is not configured') };
  }
  return supabase.auth.getSession();
}
