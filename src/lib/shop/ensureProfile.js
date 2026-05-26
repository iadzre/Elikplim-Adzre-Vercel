import { supabase } from '../supabase';

/** Ensure auth.users row has a matching public.profiles row (shop FK). */
export async function ensureMyShopProfile() {
  const { data, error } = await supabase.rpc('ensure_my_profile');
  if (error) {
    return { profileId: null, error };
  }
  return { profileId: data ?? null, error: null };
}
