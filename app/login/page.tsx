import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';
import styles from './page.module.css';

async function signIn(formData: FormData) {
  'use server';
  const email = formData.get('email');
  if (!email || typeof email !== 'string') {
    throw new Error('Email is required.');
  }
  const supabase = getSupabaseServerComponentClient();
  const redirectTo = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo
    }
  });
  if (error) {
    throw new Error(error.message);
  }
}

export default async function LoginPage() {
  const supabase = getSupabaseServerComponentClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/projects');
  }

  return (
    <div className={styles.loginWrapper}>
      <form action={signIn} className={styles.loginForm}>
        <h1>Zenoàh Urban Design Studio</h1>
        <p>Access the planning studio via secure magic link.</p>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        <button className={styles.submitButton} type="submit">Send magic link</button>
      </form>

    </div>
  );
}
