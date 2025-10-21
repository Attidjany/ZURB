import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';

export async function POST() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const response = NextResponse.redirect(`${baseUrl}/login`);
  response.cookies.delete('sb-access-token');
  response.cookies.delete('sb-refresh-token');
  return response;
}
