import { supabase } from '../../lib/supabaseClient';
import { Profile } from '../../types';

export const getProfile = async (userId: string): Promise<Profile | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error fetching profile", error);
    return null;
  }
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  if (!supabase) throw new Error("DB not connected");

  console.log("[Profile] Attempting save for:", userId, updates);

  // HOTFIX: Use upsert instead of update. 
  // If the profile row is missing (trigger failed), this will create it.
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ 
      user_id: userId,
      ...updates 
    })
    .select()
    .single();

  if (error) {
    console.error("[Profile] Supabase Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    });
    throw error;
  }
  return data;
};