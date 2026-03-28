'use client';
import { useActionState } from 'react';
import { loginAction } from './actions';
import styles from './login.module.css';

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Portal Admin</h2>
          <p>Silakan masuk untuk mengelola konten Leher Adventure.</p>
        </div>
        <form action={formAction} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" placeholder="Masukkan username" required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" placeholder="Masukkan password" required />
          </div>
          {state?.error && <div className={styles.error}>{state.error}</div>}
          <button type="submit" className={styles.submitBtn}>
            Masuk ke Portal
          </button>
        </form>
      </div>
    </div>
  );
}
