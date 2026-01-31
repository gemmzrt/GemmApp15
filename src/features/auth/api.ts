import { supabase } from '../../lib/supabaseClient';

// Changed: No more Magic Link. We use Anonymous Auth.
export const signInAnonymously = async () => {
  if (!supabase) throw new Error("DB not connected");
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data;
};

export const claimInviteCode = async (code: string) => {
  if (!supabase) throw new Error("DB not connected");

  // This RPC must associate the code with the currently signed-in (anon) user
  const { data, error } = await supabase.rpc('claim_invite_code', {
    invite_code: code 
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
  // Clear local storage if any
  sessionStorage.clear();
  // Hard reload to reset states
  window.location.reload();
};

export const getCurrentSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};