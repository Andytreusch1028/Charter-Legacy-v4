import { createClient } from '@supabase/supabase-js';

const url = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) || process.env.VITE_SUPABASE_URL;
const anonKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || process.env.VITE_SUPABASE_ANON_KEY;

// Lazy singleton client; do not initialize if envs are missing (useful in CI/build)
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    if (!url || !anonKey) {
      // eslint-disable-next-line no-console
      console.warn('Supabase env vars not set; returning null client');
      return null as unknown as ReturnType<typeof createClient>;
    }
    _client = createClient(url as string, anonKey as string);
  }
  return _client;
}
