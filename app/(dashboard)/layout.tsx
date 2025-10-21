import { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import styles from './layout.module.css';

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
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <strong>ZUDS</strong>
          <nav className={styles.nav}>
            <Link className={styles.navLink} href="/projects">
              Projects
            </Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post" className={styles.form}>
          <span aria-live="polite">{profile?.email ?? session.user.email}</span>
          <button className={styles.signOutButton} type="submit">
            Sign out
          </button>
        </form>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
