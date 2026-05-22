import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

/**
 * Public anon client only — no user auth. Inserts/selects are governed by RLS
 * in supabase/migrations/001_initial_schema.sql.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient | null}
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabase);
}
