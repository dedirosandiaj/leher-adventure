'use client';
import { useActionState, useState, useRef } from 'react';
import { addTeamMember, updateTeamMember, deleteTeamMember } from './actions';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../crud.module.css';

export default function CrudTeam({ members }) {
  const [state, formAction, isPending] = useActionState(addTeamMember, null);
  const [updateState, updateFormAction, isUpdatePending] = useActionState(updateTeamMember, null);
  const [editingMember, setEditingMember] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setPreviewUrl(member.photo || null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    setEditingMember(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openDeleteModal = (member) => {
    setMemberToDelete(member);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setMemberToDelete(null);
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      await deleteTeamMember(memberToDelete.id);
      closeModal();
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Tim Kami</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>{editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}</h2>
        <form action={editingMember ? updateFormAction : formAction} className={styles.form}>
          {editingMember && <input type="hidden" name="id" value={editingMember.id} />}
          {editingMember?.photo && (
            <input type="hidden" name="existingPhoto" value={editingMember.photo} />
          )}
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Nama Lengkap</label>
              <input type="text" name="name" placeholder="Contoh: Budi Santoso" defaultValue={editingMember?.name || ''} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Username Instagram</label>
              <input type="text" name="ig" placeholder="Contoh: @budi_santoso" defaultValue={editingMember?.ig || ''} required />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Upload Foto Profile {editingMember && '(Kosongkan jika tidak diubah)'}</label>
              <input 
                ref={fileInputRef}
                type="file" 
                name="photoFile" 
                accept="image/*"
                onChange={handleFileChange}
                required={!editingMember}
              />
              {(previewUrl || editingMember?.photo) && (
                <div className={styles.imagePreview} style={{marginTop: '10px'}}>
                  <img 
                    src={previewUrl || editingMember?.photo} 
                    alt="Photo Preview" 
                    style={{width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--secondary)'}}
                  />
                </div>
              )}
            </div>
          </div>
          
          {(state?.error || updateState?.error) && <p className={styles.error}>{state?.error || updateState?.error}</p>}
          {(state?.success || updateState?.success) && <p className={styles.success}>{state?.success || updateState?.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending || isUpdatePending}>
              {isPending || isUpdatePending ? 'Menyimpan...' : (editingMember ? 'Update Anggota' : 'Tambah Anggota')}
            </button>
            {editingMember && <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Batal</button>}
          </div>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Daftar Anggota ({members.length})</h2>
        {members.length === 0 ? (
          <p className={styles.empty}>Belum ada anggota. Tambahkan di atas.</p>
        ) : (
          <div className={styles.teamGrid}>
            {members.map(m => (
              <div key={m.id} className={styles.teamCard}>
                <div className={styles.teamPhoto}>
                  <img 
                    src={m.photo || '/images/hero.png'} 
                    alt={m.name}
                  />
                </div>
                <div className={styles.teamName}>{m.name}</div>
                <div className={styles.teamIg}>{m.ig}</div>
                <div className={styles.teamActions}>
                  <button type="button" className={styles.editBtn} onClick={() => handleEdit(m)}>Edit</button>
                  <button 
                    type="button" 
                    className={styles.deleteBtn}
                    onClick={() => openDeleteModal(m)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Hapus Anggota"
        message={memberToDelete ? `Yakin ingin menghapus ${memberToDelete.name}? Foto juga akan terhapus dari server.` : ''}
      />
    </div>
  );
}
