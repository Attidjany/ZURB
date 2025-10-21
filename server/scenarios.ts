'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { Json } from '@/lib/types';

interface ScenarioForm {
  siteId: string;
  name: string;
  notes?: string;
}

export async function createScenarioAction(form: ScenarioForm) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('scenarios')
    .insert({ site_id: form.siteId, name: form.name, notes: form.notes ?? null, created_by: session.user.id })
    .select('id')
    .single();

  if (error) {
    console.error(error);
    throw new Error('Failed to create scenario');
  }

  revalidatePath(`/sites/${form.siteId}/scenarios`);
  redirect(`/scenarios/${data.id}`);
}

interface ScenarioItemForm {
  scenarioId: string;
  typology: string;
  units: number;
  gfa: number;
  overrides?: Json;
}

export async function upsertScenarioItemAction(form: ScenarioItemForm) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase.from('scenario_items').upsert(
    {
      scenario_id: form.scenarioId,
      typology_code: form.typology,
      units: form.units,
      gfa_m2: form.gfa,
      overrides: form.overrides ?? null
    },
    { onConflict: 'scenario_id,typology_code' }
  );

  if (error) {
    console.error(error);
    throw new Error('Failed to save scenario item');
  }

  revalidatePath(`/scenarios/${form.scenarioId}`);
}

export async function deleteScenarioItemAction(scenarioId: string, typology: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('scenario_items')
    .delete()
    .eq('scenario_id', scenarioId)
    .eq('typology_code', typology);

  if (error) {
    console.error(error);
    throw new Error('Failed to delete scenario item');
  }

  revalidatePath(`/scenarios/${scenarioId}`);
}

export async function updateScenarioNotesAction(scenarioId: string, notes: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('scenarios')
    .update({ notes })
    .eq('id', scenarioId);

  if (error) {
    console.error(error);
    throw new Error('Failed to update notes');
  }

  revalidatePath(`/scenarios/${scenarioId}`);
}
