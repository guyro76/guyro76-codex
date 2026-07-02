import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_PAPRIKA_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_PAPRIKA_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

export function getSupabaseBrowserClient() {
  if (!url || !anonKey) return null;
  return createBrowserClient(url, anonKey);
}
