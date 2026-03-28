'use client';
import { useActionState, useState } from 'react';
import { addJourneyYear, updateJourney, deleteJourney, addMountain, updateMountain, deleteMountain } from './actions';
import styles from '../crud.module.css';

export default function CrudJourney({ journeys }) {
  const [yearState, yearFormAction] = useActionState(addJourneyYear, null);
  const [updateYearState, updateYearFormAction] = useActionState(updateJourney, null);
  const [mtState, mtFormAction] = useActionState(addMountain, null);
  const [updateMtState, updateMtFormAction] = useActionState(updateMountain, null);
  const [editingJourney, setEditingJourney] = useState(null);
  const [editingMountain, setEditingMountain] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Jejak Kami</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>{editingJourney ? 'Edit Tahun Ekspedisi' : 'Tambah Tahun Ekspedisi'}</h2>
        <form action={editingJourney ? updateYearFormAction : yearFormAction} className={styles.form}>
          {editingJourney && <input type="hidden" name="id" value={editingJourney.id} />}
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Tahun</label>
              <input type="text" name="year" placeholder="Contoh: 2024" defaultValue={editingJourney?.year || ''} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select name="status" defaultValue={editingJourney?.status || 'Selesai'}>
                <option value="Selesai">Selesai</option>
                <option value="Rencana">Rencana</option>
                <option value="Berlangsung">Berlangsung</option>
              </select>
            </div>
          </div>
          {(yearState?.error || updateYearState?.error) && <p className={styles.error}>{yearState?.error || updateYearState?.error}</p>}
          {(yearState?.success || updateYearState?.success) && <p className={styles.success}>{yearState?.success || updateYearState?.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn}>{editingJourney ? 'Update Tahun' : 'Tambah Tahun'}</button>
            {editingJourney && <button type="button" className={styles.cancelBtn} onClick={() => setEditingJourney(null)}>Batal</button>}
          </div>
        </form>
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Tambah Gunung ke Tahun</h2>
        <form action={mtFormAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Nama Gunung</label>
              <input type="text" name="name" placeholder="Contoh: Gunung Rinjani" required />
            </div>
            <div className={styles.inputGroup}>
              <label>Tahun Ekspedisi</label>
              <select name="journeyId" required>
                <option value="">-- Pilih Tahun --</option>
                {journeys.map(j => (
                  <option key={j.id} value={j.id}>{j.year}</option>
                ))}
              </select>
            </div>
          </div>
          {mtState?.error && <p className={styles.error}>{mtState.error}</p>}
          {mtState?.success && <p className={styles.success}>{mtState.success}</p>}
          <button type="submit" className={styles.addBtn}>Tambah Gunung</button>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Daftar Ekspedisi ({journeys.length} Tahun)</h2>
        {journeys.length === 0 ? (
          <p className={styles.empty}>Belum ada data. Tambahkan di atas.</p>
        ) : journeys.map(j => (
          <div key={j.id} className={styles.journeyCard}>
            <div className={styles.journeyHeader}>
              <span className={styles.journeyYear}>{j.year} <span className={styles.journeyStatus}>{j.status}</span></span>
              <div className={styles.actionGroup}>
                <button type="button" className={styles.editBtn} onClick={() => setEditingJourney(j)}>Edit</button>
                <form action={async () => {
                  if (confirm(`Yakin ingin menghapus tahun ${j.year}? Semua gunung terkait akan ikut terhapus.`)) {
                    await deleteJourney(j.id);
                  }
                }} style={{display:'inline'}}>
                  <button type="submit" className={styles.deleteBtn}>Hapus</button>
                </form>
              </div>
            </div>
            <ul className={styles.mountainList}>
              {j.mountains.map(m => (
                <li key={m.id}>
                  {editingMountain?.id === m.id ? (
                    <form action={updateMtFormAction} style={{display:'inline-flex', gap:'8px', alignItems:'center'}}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="text" name="name" defaultValue={m.name} required style={{padding:'4px 8px'}} />
                      <button type="submit" className={styles.saveBtn}>Simpan</button>
                      <button type="button" className={styles.cancelBtnSm} onClick={() => setEditingMountain(null)}>Batal</button>
                    </form>
                  ) : (
                    <>
                      {m.name}
                      <div className={styles.mountainActions}>
                        <button type="button" className={styles.editBtnSm} onClick={() => setEditingMountain(m)}>Edit</button>
                        <form action={async () => {
                          if (confirm(`Yakin ingin menghapus ${m.name}?`)) {
                            await deleteMountain(m.id);
                          }
                        }} style={{display:'inline'}}>
                          <button type="submit" className={styles.deleteBtnSm}>✕</button>
                        </form>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {j.mountains.length === 0 && <li className={styles.empty}>Belum ada gunung.</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
