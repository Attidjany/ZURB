'use server';

import { revalidatePath } from 'next/cache';
import { normalizeToMultiPolygon } from '@/lib/geometry';
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from '@/lib/supabaseServer';
import { Json } from '@/lib/types';

export async function updateSiteGeometryAction(siteId: string, geoJsonText: string) {
  const sessionClient = getSupabaseServerClient();
  const {
    data: { session }
  } = await sessionClient.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  let parsed: Json;
  try {
    parsed = JSON.parse(geoJsonText);
  } catch (error) {
    throw new Error('Invalid JSON payload.');
  }

  const multiPolygon = normalizeToMultiPolygon(parsed as any);

  const serviceClient = getSupabaseServiceRoleClient();
  const { data, error } = await serviceClient.rpc('fn_upsert_site_geometry', {
    p_site_id: siteId,
    p_geojson: multiPolygon as unknown as Json
  });

  if (error) {
    console.error(error);
    throw new Error('Failed to update site geometry.');
  }

  revalidatePath(`/sites/${siteId}/plan`);
  return data;
}
