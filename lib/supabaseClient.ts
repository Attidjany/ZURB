import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is missing.');
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
