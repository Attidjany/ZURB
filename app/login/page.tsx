/* eslint-disable @typescript-eslint/no-misused-promises */
'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import styles from './login.module.css';

// Uses public keys (anon/publishable). Do NOT put service role here.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/projects`
              : undefined,
        },
      });
      if (error) throw error;
      setMsg('Check your email for the magic link.');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setErr(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <h1 className={styles.title}>Sign in</h1>
      <form onSubmit={handleMagicLinkLogin} className={styles.form}>
        <label className={styles.label}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Sending…' : 'Send magic link'}
        </button>
      </form>
      {msg && <p className={styles.ok}>{msg}</p>}
      {err && <p className={styles.err}>{err}</p>}
      <p className={styles.hint}>
        After sign-in you’ll be redirected to <code>/projects</code>.
      </p>
    </main>
  );
}