import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Database } from '@/lib/types';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userId = session.user.id;
//const userId: Database['public']['Tables']['profiles']['Row']['id'] = session.user.id;

const { data: profile } = await supabase
  .from('profiles')
  .select('email')
  .eq('id' as const, session.user.id as string)
  .single();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.leftGroup}>
          <strong>ZUDS</strong>
          <nav className={styles.nav}>
            <Link href="/projects">Projects</Link>
          </nav>
        </div>
        <form action="/auth/signout" method="post" className={styles.form}>
          <span aria-live="polite">{profile?.email ?? session.user.email}</span>
          <button type="submit" className={styles.signoutBtn}>Sign out</button>
        </form>
      </header>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
