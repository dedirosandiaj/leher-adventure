'use client';
import { useActionState } from 'react';
import { updateProfile } from './actions';
import styles from '../crud.module.css';

export default function ProfileForm({ admin }) {
  const [profileState, profileAction] = useActionState(updateProfile, null);

  return (
    <div>
      <h1 className={styles.pageTitle}>Profil Admin</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Edit Profil</h2>
        <form action={profileAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input type="text" name="username" defaultValue={admin?.username || ''} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Password Saat Ini</label>
              <input type="password" name="currentPassword" placeholder="Masukkan password saat ini" required />
            </div>
            <div className={styles.inputGroup}>
              <label>Password Baru (kosongkan jika tidak diubah)</label>
              <input type="password" name="newPassword" placeholder="Password baru" />
            </div>
          </div>
          {profileState?.error && <p className={styles.error}>{profileState.error}</p>}
          {profileState?.success && <p className={styles.success}>{profileState.success}</p>}
          <button type="submit" className={styles.addBtn}>Update Profil</button>
        </form>
      </div>
    </div>
  );
}
