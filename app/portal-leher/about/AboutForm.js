'use client';
import { useActionState } from 'react';
import { updateAbout } from './actions';
import styles from '../crud.module.css';

export default function AboutForm({ about }) {
  const [state, formAction, isPending] = useActionState(updateAbout, null);

  return (
    <div>
      <h1 className={styles.pageTitle}>Edit Tentang Kami</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Konten Tentang Kami</h2>
        <form action={formAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Judul</label>
              <input 
                type="text" 
                name="title" 
                placeholder="Tentang Kami" 
                defaultValue={about?.title || ''} 
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Paragraf 1</label>
              <textarea 
                name="paragraph1" 
                placeholder="Deskripsi paragraf pertama..."
                defaultValue={about?.paragraph1 || ''}
                rows="4"
                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Paragraf 2</label>
              <textarea 
                name="paragraph2" 
                placeholder="Deskripsi paragraf kedua..."
                defaultValue={about?.paragraph2 || ''}
                rows="4"
                style={{width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd'}}
                required
              />
            </div>
          </div>
          
          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.success && <p className={styles.success}>{state.success}</p>}
          
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Update Tentang Kami'}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Preview</h2>
        <div style={{padding: '2rem', background: 'var(--primary)', color: 'white', borderRadius: '12px'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '1rem', color: 'var(--secondary)'}}>{about?.title}</h2>
          <p style={{fontSize: '1.1rem', marginBottom: '1rem', lineHeight: '1.8'}}>{about?.paragraph1}</p>
          <p style={{fontSize: '1.1rem', lineHeight: '1.8'}}>{about?.paragraph2}</p>
        </div>
      </div>
    </div>
  );
}
