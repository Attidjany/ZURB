import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import { redirect } from 'next/navigation';

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
    owner_id: session!.user.id
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
    <div className="stack">
      <section>
        <h1>Projects</h1>
        <p>Plan, analyse, and manage urban sites.</p>
      </section>
      <section>
        <form action={createProject} className="project-form">
          <h2>Create project</h2>
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required />
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows={2} />
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <ul className="project-grid">
          {projects.map((project) => (
            <li key={project!.id}>
              <Link href={`/projects/${project!.id}/sites`}>
                <strong>{project!.name}</strong>
                <p>{project!.description ?? 'No description yet.'}</p>
              </Link>
            </li>
          ))}
          {projects.length === 0 && <li>No projects yet. Create one above.</li>}
        </ul>
      </section>
      <style jsx>{`
        .stack {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .project-form {
          display: grid;
          gap: 0.75rem;
          max-width: 480px;
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
        .project-grid {
          list-style: none;
          padding: 0;
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }
        .project-grid li {
          background: #fff;
          padding: 1rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
        }
        .project-grid a {
          color: inherit;
          text-decoration: none;
          display: grid;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
}
