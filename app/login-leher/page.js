'use client';
import { useActionState } from 'react';
import { useState } from 'react';
import { loginAction, resetPasswordAction } from './actions';
import styles from './login.module.css';

export default function LoginPage() {
  const [loginState, loginActionForm] = useActionState(loginAction, null);
  const [resetState, resetActionForm] = useActionState(resetPasswordAction, null);
  const [showResetForm, setShowResetForm] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Portal Admin</h2>
          <p>Silakan masuk untuk mengelola konten Leher Adventure.</p>
        </div>
        
        {!showResetForm ? (
          <>
            <form action={loginActionForm} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="username">Username</label>
                <input type="text" id="username" name="username" placeholder="Masukkan username" required />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" placeholder="Masukkan password" required />
              </div>
              {loginState?.error && <div className={styles.error}>{loginState.error}</div>}
              <button type="submit" className={styles.submitBtn}>
                Masuk ke Portal
              </button>
            </form>
            <div className={styles.footer}>
              <button 
                type="button" 
                className={styles.linkBtn}
                onClick={() => setShowResetForm(true)}
              >
                Lupa password? Reset di sini
              </button>
            </div>
          </>
        ) : (
          <>
            <form action={resetActionForm} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="reset-username">Username</label>
                <input 
                  type="text" 
                  id="reset-username" 
                  name="username" 
                  placeholder="Masukkan username untuk reset" 
                  required 
                />
              </div>
              {resetState?.error && <div className={styles.error}>{resetState.error}</div>}
              {resetState?.success && <div className={styles.success}>{resetState.success}</div>}
              <button type="submit" className={styles.submitBtn}>
                Reset Password
              </button>
            </form>
            <div className={styles.footer}>
              <button 
                type="button" 
                className={styles.linkBtn}
                onClick={() => setShowResetForm(false)}
              >
                Kembali ke Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
