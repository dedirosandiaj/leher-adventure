'use client';
import { useActionState } from 'react';
import styles from './login.module.css';

export default function LoginForm({ loginAction }) {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className={styles.loginCard}>
      <div className={styles.logo}>
        <img src="/images/logo-leher.png" alt="Leher Adventure" />
      </div>
      <h1 className={styles.title}>Member Portal</h1>
      <p className={styles.subtitle}>Login khusus anggota Leher Adventure</p>
      
      <form action={formAction} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Username</label>
          <input 
            type="text" 
            name="username" 
            placeholder="Masukkan username"
            required 
          />
        </div>
        
        <div className={styles.inputGroup}>
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Masukkan password"
            required 
          />
        </div>
        
        {state?.error && <p className={styles.error}>{state.error}</p>}
        
        <button type="submit" className={styles.loginBtn} disabled={isPending}>
          {isPending ? 'Loading...' : 'Login'}
        </button>
      </form>
      
      <a href="/" className={styles.backLink}>← Kembali ke Website</a>
    </div>
  );
}
