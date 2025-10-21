import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';

async function createSite(projectId: string, formData: FormData) {
  'use server';
  const supabase = getSupabaseServerComponentClient();
  const name = formData.get('name');
  if (!name || typeof name !== 'string') {
    throw new Error('Site name is required.');
  }
  const { error } = await supabase.from('sites').insert({ project_id: projectId, name });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(`/projects/${projectId}/sites`);
}

export default async function ProjectSitesPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseServerComponentClient();

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, name, description')
    .eq('id', params.id)
    .single();

  if (!project || projectError) {
    notFound();
  }

  const { data: sites } = await supabase
    .from('sites')
    .select('id, name, area_ha')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  async function action(formData: FormData) {
    'use server';
    await createSite(params.id, formData);
  }

  return (
    <div className="stack">
      <header>
        <h1>{project.name}</h1>
        <p>{project.description ?? 'No description provided.'}</p>
      </header>
      <section>
        <form action={action} className="site-form">
          <h2>Add site</h2>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
          <button type="submit">Create site</button>
        </form>
      </section>
      <section>
        <ul className="site-grid">
          {(sites ?? []).map((site) => (
            <li key={site.id}>
              <Link href={`/sites/${site.id}/plan`}>
                <strong>{site.name}</strong>
                <span>{site.area_ha ? `${site.area_ha.toFixed(2)} ha` : 'Upload geometry to compute area.'}</span>
              </Link>
              <div className="links">
                <Link href={`/sites/${site.id}/plan`}>Plan</Link>
                <Link href={`/sites/${site.id}/scenarios`}>Scenarios</Link>
              </div>
            </li>
          ))}
          {(sites ?? []).length === 0 && <li>No sites yet.</li>}
        </ul>
      </section>
      <style jsx>{`
        .stack {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .site-form {
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
        .site-grid {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        .site-grid li {
          background: #fff;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          display: grid;
          gap: 0.5rem;
        }
        .site-grid a {
          text-decoration: none;
          color: inherit;
        }
        .links {
          display: flex;
          gap: 0.75rem;
        }
      `}</style>
    </div>
  );
}
