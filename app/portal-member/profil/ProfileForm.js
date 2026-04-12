'use client';
import { useState } from 'react';
import { useActionState } from 'react';
import styles from './profile.module.css';

export default function ProfileForm({ member, isTeamMember, photoUrl, updateAction }) {
  const [state, formAction, isPending] = useActionState(updateAction, null);
  const [previewUrl, setPreviewUrl] = useState(photoUrl);
  
  // Username is the Instagram handle
  const username = member?.username || '';
  const name = member?.name || '';

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  return (
    <form action={formAction} className={styles.form}>
      {/* Photo Upload */}
      <div className={styles.photoSection}>
        <div className={styles.photoWrapper}>
          {previewUrl ? (
            <img src={previewUrl} alt="Profile" className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder}>
              <svg viewBox="0 0 24 24" width="40" height="40" fill="#999">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          )}
        </div>
        <label className={styles.uploadBtn}>
          <input 
            type="file" 
            name="photoFile" 
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
          {previewUrl ? 'Ganti Foto' : 'Upload Foto'}
        </label>
        {photoUrl && <input type="hidden" name="existingPhoto" value={photoUrl} />}
      </div>

      {/* Name */}
      <div className={styles.inputGroup}>
        <label>Nama Lengkap</label>
        <input 
          type="text" 
          name="name" 
          placeholder="Masukkan nama lengkap"
          defaultValue={name}
        />
      </div>

      {/* Username - Readonly */}
      <div className={styles.inputGroup}>
        <label>Username Instagram</label>
        <input 
          type="text" 
          name="username" 
          defaultValue={username}
          readOnly
          className={styles.readonlyInput}
        />
        <small>Username Instagram (tidak dapat diubah)</small>
      </div>

      {/* Messages */}
      {state?.error && <p className={styles.error}>{state.error}</p>}
      {state?.success && <p className={styles.success}>{state.success}</p>}

      {/* Submit */}
      <button type="submit" className={styles.saveBtn} disabled={isPending}>
        {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
