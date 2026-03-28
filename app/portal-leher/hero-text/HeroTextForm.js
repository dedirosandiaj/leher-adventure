'use client';
import { useActionState } from 'react';
import { updateHeroText } from './actions';
import styles from '../crud.module.css';

export default function HeroTextForm({ heroText }) {
  const [state, formAction, isPending] = useActionState(updateHeroText, null);

  return (
    <div>
      <h1 className={styles.pageTitle}>Edit Text Hero</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Text Header Hero</h2>
        <form action={formAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Judul (Baris 1)</label>
              <input 
                type="text" 
                name="title" 
                placeholder="Jelajahi Alam," 
                defaultValue={heroText?.title || ''} 
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Judul (Baris 2)</label>
              <input 
                type="text" 
                name="subtitle" 
                placeholder="Temukan Jati Diri." 
                defaultValue={heroText?.subtitle || ''} 
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Deskripsi</label>
              <textarea 
                name="description" 
                placeholder="Komunitas pecinta alam yang berdedikasi..."
                defaultValue={heroText?.description || ''}
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
              {isPending ? 'Menyimpan...' : 'Update Text Hero'}
            </button>
          </div>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Preview Text</h2>
        <div style={{padding: '2rem', background: 'var(--primary)', color: 'white', borderRadius: '12px'}}>
          <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>
            {heroText?.title}<br />
            <span style={{color: 'var(--secondary)'}}>{heroText?.subtitle}</span>
          </h1>
          <p style={{fontSize: '1.1rem', opacity: 0.9}}>{heroText?.description}</p>
        </div>
      </div>
    </div>
  );
}
