import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import styles from './page.module.css';

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
    <div className={styles.stack}>
      <header>
        <h1>{project.name}</h1>
        <p>{project.description ?? 'No description provided.'}</p>
      </header>
      <section>
        <form action={action} className={styles.siteForm}>
          <h2>Add site</h2>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
          <button className={styles.createButton} type="submit">
            Create site
          </button>
        </form>
      </section>
      <section>
        <ul className={styles.siteGrid}>
          {(sites ?? []).map((site) => (
            <li className={styles.siteGridItem} key={site.id}>
              <Link className={styles.siteLink} href={`/sites/${site.id}/plan`}>
                <strong>{site.name}</strong>
                <span>{site.area_ha ? `${site.area_ha.toFixed(2)} ha` : 'Upload geometry to compute area.'}</span>
              </Link>
              <div className={styles.links}>
                <Link className={styles.siteLink} href={`/sites/${site.id}/plan`}>
                  Plan
                </Link>
                <Link className={styles.siteLink} href={`/sites/${site.id}/scenarios`}>
                  Scenarios
                </Link>
              </div>
            </li>
          ))}
          {(sites ?? []).length === 0 && <li className={styles.siteGridItem}>No sites yet.</li>}
        </ul>
      </section>
    </div>
  );
}
