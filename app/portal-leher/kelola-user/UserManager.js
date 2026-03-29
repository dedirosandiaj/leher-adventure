'use client';
import { useState } from 'react';
import { useActionState } from 'react';
import { addUser, updateUser, deleteUser } from './actions';
import Modal from '@/components/Modal';
import styles from '../crud.module.css';

const ROLES = ['admin', 'member'];

export default function UserManager({ users, currentAdmin }) {
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [addState, addFormAction] = useActionState(addUser, null);
  const [updateState, updateFormAction] = useActionState(updateUser, null);

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      closeModal();
    }
  };

  const isCurrentUser = (userId) => {
    return currentAdmin?.id === userId;
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola User</h1>

      {/* Add/Edit Form */}
      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>{editingUser ? 'Edit User' : 'Tambah User Baru'}</h2>
        <form action={editingUser ? updateFormAction : addFormAction} className={styles.form}>
          {editingUser && <input type="hidden" name="id" value={editingUser.id} />}
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Username</label>
              <input 
                type="text" 
                name="username" 
                placeholder="Contoh: johndoe" 
                defaultValue={editingUser?.username || ''}
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Role</label>
              <select name="role" defaultValue={editingUser?.role || 'member'}>
                {ROLES.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {!editingUser && (
            <div className={styles.formRow}>
              <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                <p className={styles.passwordInfo}>
                  Password default: <strong>Passw0rdAdmin</strong> (untuk Admin) atau <strong>Passw0rdMember</strong> (untuk Member)
                </p>
              </div>
            </div>
          )}
          
          {editingUser && (
            <div className={styles.formRow}>
              <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                <label>Password (Kosongkan jika tidak diubah)</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Minimal 6 karakter"
                  minLength={6}
                />
              </div>
            </div>
          )}
          
          {(addState?.error || updateState?.error) && (
            <p className={styles.error}>{addState?.error || updateState?.error}</p>
          )}
          {(addState?.success || updateState?.success) && (
            <p className={styles.success}>{addState?.success || updateState?.success}</p>
          )}
          
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn}>
              {editingUser ? 'Update User' : 'Tambah User'}
            </button>
            {editingUser && (
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Daftar User ({users.length})</h2>
        {users.length === 0 ? (
          <p className={styles.empty}>Belum ada user. Tambahkan di atas.</p>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={isCurrentUser(user.id) ? styles.currentUser : ''}>
                    <td>{user.id}</td>
                    <td>
                      {user.username}
                      {isCurrentUser(user.id) && (
                        <span className={styles.youBadge}>(Anda)</span>
                      )}
                    </td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button 
                          type="button" 
                          className={styles.editBtnSm}
                          onClick={() => handleEdit(user)}
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          className={styles.deleteBtnSm}
                          onClick={() => openDeleteModal(user)}
                          disabled={isCurrentUser(user.id)}
                          title={isCurrentUser(user.id) ? 'Tidak bisa menghapus diri sendiri' : 'Hapus'}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus"
        message={userToDelete ? `Yakin ingin menghapus user "${userToDelete.username}"?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
}
