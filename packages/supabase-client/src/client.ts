import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@carelink/shared';

export type CareLinkSupabaseClient = SupabaseClient<Database>;

let clientInstance: CareLinkSupabaseClient | null = null;

export interface ClientConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export function getEnvCredentials(): { url: string; anonKey: string } {
  const url =
    (typeof process !== 'undefined' && process.env?.['SUPABASE_URL']) ||
    (typeof process !== 'undefined' && process.env?.['NEXT_PUBLIC_SUPABASE_URL']) ||
    (typeof process !== 'undefined' && process.env?.['VITE_SUPABASE_URL']) || '';
  const anonKey =
    (typeof process !== 'undefined' && process.env?.['SUPABASE_ANON_KEY']) ||
    (typeof process !== 'undefined' && process.env?.['NEXT_PUBLIC_SUPABASE_ANON_KEY']) ||
    (typeof process !== 'undefined' && process.env?.['VITE_SUPABASE_ANON_KEY']) || '';
  return { url, anonKey };
}

export function getCareLinkClient(config?: ClientConfig): CareLinkSupabaseClient {
  if (clientInstance) return clientInstance;
  const { url: envUrl, anonKey: envKey } = getEnvCredentials();
  const url = config?.supabaseUrl || envUrl;
  const anonKey = config?.supabaseAnonKey || envKey;
  if (!url || !anonKey) throw new Error('Supabase credentials are required.');
  clientInstance = createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return clientInstance;
}

export const supabase = getCareLinkClient;
export default getCareLinkClient;
