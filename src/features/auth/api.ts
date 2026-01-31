import { supabase } from '../../lib/supabaseClient';

export const sendMagicLink = async (email: string) => {
  if (!supabase) throw new Error("DB not connected");
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin,
    },
  });
  
  if (error) throw error;
  return true;
};

export const claimInviteCode = async (code: string) => {
  if (!supabase) throw new Error("DB not connected");

  const { data, error } = await supabase.rpc('claim_invite_code', {
    invite_code: code // Parameter name must match RPC definition
  });

  if (error) throw error;
  return data; // Returns JSON or status
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
};