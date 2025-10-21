import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { ScenarioPlanner } from '@/components/ScenarioPlanner';
import { NotesEditor } from '@/components/NotesEditor';
import { updateScenarioNotesAction } from '@/server/scenarios';
import styles from './page.module.css';

export default async function ScenarioDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerComponentClient();
  const { data: scenario } = await supabase
    .from('scenarios')
    .select('id, name, notes, site_id, sites(name)')
    .eq('id', params.id)
    .single();

  if (!scenario) {
    notFound();
  }

  const { data: items } = await supabase
    .from('scenario_items')
    .select('typology_code, units, gfa_m2')
    .eq('scenario_id', params.id);

  const { data: mixRules } = await supabase.from('mix_rules').select('category, mid_end_pct, high_end_pct, outstanding_pct');
  const { data: costParams } = await supabase.from('cost_params').select('*').order('updated_at', { ascending: false }).limit(1);
  const { data: rents } = await supabase.from('rents').select('code, monthly_usd');
  const { data: overheads } = await supabase.from('overheads').select('dev_monthly_usd, maint_monthly_usd, lease_years, infra_subsidy_pct').limit(1);

  if (!mixRules || mixRules.length === 0 || !costParams || costParams.length === 0 || !rents || rents.length === 0 || !overheads || overheads.length === 0) {
    throw new Error('Financial parameters are missing. Seed the database.');
  }

  async function saveNotes(value: string) {
    'use server';
    await updateScenarioNotesAction(params.id, value);
  }

  return (
    <div className={styles.stack}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <Link href={`/sites/${scenario.site_id}/scenarios`}>← Back to scenarios</Link>
          <h1>{scenario.name}</h1>
          <p>Site: {scenario.sites?.name ?? 'Unknown'}</p>
        </div>
        <a href={`/api/exports/scenario/${scenario.id}/csv`} target="_blank" rel="noopener noreferrer">
          Export CSV
        </a>
      </header>
      <ScenarioPlanner
        scenarioId={scenario.id}
        mixRules={mixRules}
        costParams={{
          gold_usd_per_oz: costParams[0].gold_usd_per_oz,
          grams_mid_end: costParams[0].grams_mid_end,
          grams_high_end: costParams[0].grams_high_end,
          grams_outstanding: costParams[0].grams_outstanding
        }}
        rents={rents}
        overheads={overheads[0]}
        items={items ?? []}
      />
      <section className={styles.notes}>
        <h2>Scenario notes</h2>
        <NotesEditor initialContent={scenario.notes ?? ''} onSave={saveNotes} />
      </section>
      <section className={styles.todo}>
        <h2>Geo exports</h2>
        <p>
          GeoJSON export is coming soon. For now download the placeholder{' '}
          <a href={`/api/exports/scenario/${scenario.id}/geojson`} target="_blank" rel="noopener noreferrer">
            GeoJSON stub
          </a>
          .
        </p>
      </section>
    </div>
  );
}
