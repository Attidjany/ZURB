import { cookies, headers } from 'next/headers';
import { createServerClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './types';

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        }
      }
    }
  );
}

export function getSupabaseServerComponentClient() {
  return createServerComponentClient<Database>({
    headers,
    cookies
  });
}

export function getSupabaseServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceKey || !supabaseUrl) {
    throw new Error('Service role key or Supabase URL missing');
  }

  return createServerClient<Database>(supabaseUrl, serviceKey, {
    cookies: {
      get() {
        return undefined;
      }
    }
  });
}
