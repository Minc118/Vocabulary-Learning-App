import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      ok: false,
      message: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local',
    };
  }

  if (!supabase) {
    return { ok: false, message: 'Supabase client initialization failed' };
  }

  const { error } = await supabase.auth.getSession();

  if (error) {
    return { ok: false, message: `Auth check failed: ${error.message}` };
  }

  return { ok: true, message: 'Supabase connected' };
}
