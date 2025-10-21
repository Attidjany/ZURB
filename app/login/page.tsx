import { redirect } from 'next/navigation';
import { getSupabaseServerComponentClient } from '@/lib/supabaseServer';

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
    <div className="login-wrapper">
      <form action={signIn} className="login-form">
        <h1>Zenoàh Urban Design Studio</h1>
        <p>Access the planning studio via secure magic link.</p>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
        <button type="submit">Send magic link</button>
      </form>
      <style jsx>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }
        .login-form {
          width: 100%;
          max-width: 420px;
          background: #fff;
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          display: grid;
          gap: 0.75rem;
        }
        button {
          padding: 0.75rem 1rem;
          border-radius: 999px;
          border: none;
          background-color: #1f2937;
          color: #fff;
          cursor: pointer;
        }
        button:hover,
        button:focus-visible {
          background-color: #111827;
        }
      `}</style>
    </div>
  );
}
