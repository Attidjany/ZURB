import Link from 'next/link';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { createScenarioAction } from '@/server/scenarios';
import styles from './page.module.css';

export default async function SiteScenariosPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerComponentClient();
  const { data: site } = await supabase
    .from('sites')
    .select('id, name, area_ha')
    .eq('id', params.id)
    .single();

  const { data: scenarios } = await supabase
    .from('scenarios')
    .select('id, name, created_at')
    .eq('site_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className={styles.stack}>
      <header>
        <h1>{site?.name ?? 'Site'}</h1>
        <p>Manage design and financial strategies.</p>
      </header>
      <section>
        <form action={createScenarioAction} className={styles.scenarioForm}>
          <h2>New scenario</h2>
          <input type="hidden" name="siteId" value={params.id} />
          <label htmlFor="scenario-name">Name</label>
          <input id="scenario-name" name="name" required />
          <label htmlFor="scenario-notes">Notes</label>
          <textarea id="scenario-notes" name="notes" rows={3} />
          <button className={styles.createButton} type="submit">
            Create scenario
          </button>
        </form>
      </section>
      <section>
        <ul className={styles.scenarioGrid}>
          {(scenarios ?? []).map((scenario) => (
            <li className={styles.scenarioGridItem} key={scenario.id}>
              <Link className={styles.scenarioLink} href={`/scenarios/${scenario.id}`}>
                <strong>{scenario.name}</strong>
                <span>{new Date(scenario.created_at).toLocaleString()}</span>
              </Link>
            </li>
          ))}
          {(scenarios ?? []).length === 0 && <li className={styles.scenarioGridItem}>No scenarios yet.</li>}
        </ul>
      </section>
    </div>
  );
}
