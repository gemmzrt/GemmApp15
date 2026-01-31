import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';

let supabase: SupabaseClient | null = null;

if (env.ok && env.data) {
  supabase = createClient(env.data.VITE_SUPABASE_URL, env.data.VITE_SUPABASE_ANON_KEY);
}

export { supabase };