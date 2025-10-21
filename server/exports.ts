import { getSupabaseServiceRoleClient } from '@/lib/supabaseServer';

export async function generateScenarioCsv(scenarioId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data: items } = await supabase
    .from('scenario_items')
    .select('typology_code, units, gfa_m2')
    .eq('scenario_id', scenarioId);

  const header = 'typology_code,units,gfa_m2';
  const rows = (items ?? []).map((item) => `${item.typology_code},${item.units},${item.gfa_m2}`);
  return [header, ...rows].join('\n');
}

export async function generateScenarioGeoJSON(scenarioId: string) {
  const supabase = getSupabaseServiceRoleClient();
  const { data: scenario } = await supabase
    .from('scenarios')
    .select('site_id, sites:sites(geom)')
    .eq('id', scenarioId)
    .single();

  const feature = {
    type: 'Feature',
    properties: {
      scenario_id: scenarioId
    },
    geometry: scenario?.sites?.geom ?? null
  };

  return {
    type: 'FeatureCollection',
    features: [feature]
  };
}
