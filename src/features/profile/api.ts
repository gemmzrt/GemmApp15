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

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};