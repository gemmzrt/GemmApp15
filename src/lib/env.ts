import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const processEnv = {
  VITE_SUPABASE_URL: (import.meta as any).env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
};

const result = envSchema.safeParse(processEnv);

export const env = {
  ok: result.success,
  data: result.success ? result.data : undefined,
  error: !result.success ? result.error : undefined,
  missingVars: !result.success
    ? result.error?.issues.map((i) => i.path.join('.'))
    : [],
};