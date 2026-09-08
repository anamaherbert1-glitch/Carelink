import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('CareLink: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY are not configured.');
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);

export default supabase;
