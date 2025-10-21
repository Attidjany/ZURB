import Link from 'next/link';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { createScenarioAction } from '@/server/scenarios';

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
    <div className="stack">
      <header>
        <h1>{site?.name ?? 'Site'}</h1>
        <p>Manage design and financial strategies.</p>
      </header>
      <section>
        <form action={createScenarioAction} className="scenario-form">
          <h2>New scenario</h2>
          <input type="hidden" name="siteId" value={params.id} />
          <label htmlFor="scenario-name">Name</label>
          <input id="scenario-name" name="name" required />
          <label htmlFor="scenario-notes">Notes</label>
          <textarea id="scenario-notes" name="notes" rows={3} />
          <button type="submit">Create scenario</button>
        </form>
      </section>
      <section>
        <ul className="scenario-grid">
          {(scenarios ?? []).map((scenario) => (
            <li key={scenario.id}>
              <Link href={`/scenarios/${scenario.id}`}>
                <strong>{scenario.name}</strong>
                <span>{new Date(scenario.created_at).toLocaleString()}</span>
              </Link>
            </li>
          ))}
          {(scenarios ?? []).length === 0 && <li>No scenarios yet.</li>}
        </ul>
      </section>
      <style jsx>{`
        .stack {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .scenario-form {
          display: grid;
          gap: 0.75rem;
          max-width: 420px;
          background: #fff;
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }
        button {
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1rem;
          background: #111827;
          color: #fff;
          cursor: pointer;
        }
        button:hover,
        button:focus-visible {
          background: #1f2937;
        }
        .scenario-grid {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        .scenario-grid li {
          background: #fff;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }
        .scenario-grid a {
          text-decoration: none;
          color: inherit;
          display: grid;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
