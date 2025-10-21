import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';
import styles from './page.module.css';

async function createProject(formData: FormData) {
  'use server';
  const supabase = getSupabaseServerComponentClient();
  const name = formData.get('name');
  const description = formData.get('description');

  if (!name || typeof name !== 'string') {
    throw new Error('Project name is required.');
  }

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { error } = await supabase.from('projects').insert({
    name,
    description: typeof description === 'string' ? description : null,
    owner_id: session.user.id
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/projects');
}

export default async function ProjectsPage() {
  const supabase = getSupabaseServerComponentClient();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: owned } = await supabase
    .from('projects')
    .select('id, name, description, created_at')
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false });

  const { data: member } = await supabase
    .from('project_members')
    .select('projects(id, name, description, created_at)')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  const projects = [
    ...(owned ?? []),
    ...((member ?? []).map((entry) => entry.projects).filter(Boolean) as typeof owned)
  ];

  return (
    <div className={styles.stack}>
      <section>
        <h1>Projects</h1>
        <p>Plan, analyse, and manage urban sites.</p>
      </section>

      <section>
        <form action={createProject} className={styles.projectForm}>
          <h2>Create project</h2>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={2} />
          <button type="submit" className={styles.button}>Create</button>
        </form>
      </section>

      <section>
        <ul className={styles.projectGrid}>
          {projects.map((project) => (
            <li key={project!.id} className={styles.projectCard}>
              <Link href={`/projects/${project!.id}/sites`} className={styles.link}>
                <strong>{project!.name}</strong>
                <p>{project!.description ?? 'No description yet.'}</p>
              </Link>
            </li>
          ))}
          {projects.length === 0 && <li>No projects yet. Create one above.</li>}
        </ul>
      </section>
    </div>
  );
}
