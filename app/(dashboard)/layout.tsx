import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = getSupabaseServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('email').eq('id', session.user.id).single();

  return (
    <div className="dashboard">
      <header>
        <div>
          <strong>ZUDS</strong>
          <nav>
            <Link href="/projects">Projects</Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post">
          <span aria-live="polite">{profile?.email ?? session.user.email}</span>
          <button type="submit">Sign out</button>
        </form>
      </header>
      <div className="content">{children}</div>
      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
        }
        header div {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        nav {
          display: flex;
          gap: 1rem;
        }
        nav a {
          text-decoration: none;
          font-weight: 500;
        }
        .content {
          flex: 1;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        form {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        button {
          border: none;
          border-radius: 999px;
          padding: 0.5rem 1rem;
          background: #ef4444;
          color: #fff;
          cursor: pointer;
        }
        button:hover,
        button:focus-visible {
          background: #dc2626;
        }
      `}</style>
    </div>
  );
}
