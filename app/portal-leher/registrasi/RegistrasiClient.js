'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { updateRegistrationStatus, deleteRegistration } from './actions';
import styles from '../crud.module.css';

export default function RegistrasiClient({ registrations, journeys, stats }) {
  const [selectedJourney, setSelectedJourney] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isUpdatePending, startUpdateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const [updateState, updateAction] = useActionState(updateRegistrationStatus, null);
  const [deleteState, deleteAction] = useActionState(deleteRegistration, null);

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    if (selectedJourney && reg.journeyId !== selectedJourney) return false;
    if (selectedStatus && reg.status !== selectedStatus) return false;
    return true;
  });

  const handleStatusChange = (id, status) => {
    startUpdateTransition(() => {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('status', status);
      updateAction(formData);
    });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleViewPhoto = async (url) => {
    console.log('Opening photo URL:', url);
    // Pastikan URL valid
    if (!url || url === 'null' || url === 'undefined') {
      alert('URL foto tidak valid');
      return;
    }
    
    // Extract key from URL
    const key = url.replace('https://s3.ucentric.id/leheradventure/', '');
    console.log('Extracted key:', key);
    
    try {
      // Get presigned URL from API
      const response = await fetch(`/api/ktp-image?key=${encodeURIComponent(key)}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Presigned URL generated:', data.url);
        setPhotoUrl(data.url);
      } else {
        // Fallback to original URL
        console.log('Using original URL');
        setPhotoUrl(url);
      }
    } catch (err) {
      console.error('Error getting presigned URL:', err);
      setPhotoUrl(url);
    }
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setPhotoUrl(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      startDeleteTransition(() => {
        const formData = new FormData();
        formData.append('id', deleteId);
        deleteAction(formData);
      });
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: styles.statusPending,
      APPROVED: styles.statusApproved,
      REJECTED: styles.statusRejected
    };
    const statusLabels = {
      PENDING: 'Menunggu',
      APPROVED: 'Diterima',
      REJECTED: 'Ditolak'
    };
    return <span className={`${styles.statusBadge} ${statusClasses[status]}`}>{statusLabels[status]}</span>;
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kelola Registrasi Pendakian</h1>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{stats.total}</span>
          <span className={styles.statLabel}>Total Registrasi</span>
        </div>
        <div className={`${styles.statCard} ${styles.statPending}`}>
          <span className={styles.statNumber}>{stats.pending}</span>
          <span className={styles.statLabel}>Menunggu</span>
        </div>
        <div className={`${styles.statCard} ${styles.statApproved}`}>
          <span className={styles.statNumber}>{stats.approved}</span>
          <span className={styles.statLabel}>Diterima</span>
        </div>
        <div className={`${styles.statCard} ${styles.statRejected}`}>
          <span className={styles.statNumber}>{stats.rejected}</span>
          <span className={styles.statLabel}>Ditolak</span>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={selectedJourney}
          onChange={(e) => setSelectedJourney(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Semua Pendakian</option>
          {journeys.map(journey => (
            <option key={journey.id} value={journey.id}>
              {journey.mountain?.name} ({journey.year})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Diterima</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      {/* Messages */}
      {updateState?.success && <div className={styles.success}>{updateState.success}</div>}
      {updateState?.error && <div className={styles.error}>{updateState.error}</div>}
      {deleteState?.success && <div className={styles.success}>{deleteState.success}</div>}
      {deleteState?.error && <div className={styles.error}>{deleteState.error}</div>}

      {/* Registrations Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>No</th>
              <th>Member</th>
              <th>Pendakian</th>
              <th>Kontak</th>
              <th>KTP</th>
              <th>Status</th>
              <th>Tanggal Daftar</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map((reg, index) => (
              <tr key={reg.id}>
                <td>{index + 1}</td>
                <td>
                  <div className={styles.memberInfo}>
                    <strong>{reg.user?.name || reg.user?.username}</strong>
                    <small>@{reg.user?.username}</small>
                  </div>
                </td>
                <td>
                  {reg.journey?.mountain?.name}
                  <small>{reg.journey?.year}</small>
                </td>
                <td>
                  <div className={styles.contactInfo}>
                    <span>{reg.phone}</span>
                    <small>{reg.email}</small>
                  </div>
                </td>
                <td>
                  <div className={styles.ktpInfo}>
                    <span>{reg.ktpNumber}</span>
                    <button
                      onClick={() => handleViewPhoto(reg.ktpPhoto)}
                      className={styles.ktpLinkBtn}
                    >
                      Lihat Foto
                    </button>
                  </div>
                </td>
                <td>{getStatusBadge(reg.status)}</td>
                <td>{new Date(reg.createdAt).toLocaleDateString('id-ID')}</td>
                <td>
                  <div className={styles.actions}>
                    {reg.status === 'PENDING' && (
                      <>
                        <button
                          className={`${styles.actionBtn} ${styles.approveBtn}`}
                          onClick={() => handleStatusChange(reg.id, 'APPROVED')}
                          disabled={isUpdatePending}
                          title="Terima"
                        >
                          ✓
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.rejectBtn}`}
                          onClick={() => handleStatusChange(reg.id, 'REJECTED')}
                          disabled={isUpdatePending}
                          title="Tolak"
                        >
                          ✕
                        </button>
                      </>
                    )}
                    {reg.status === 'REJECTED' && (
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleStatusChange(reg.id, 'APPROVED')}
                        disabled={isUpdatePending}
                        title="Terima"
                      >
                        ✓
                      </button>
                    )}
                    {reg.status === 'APPROVED' && (
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleStatusChange(reg.id, 'REJECTED')}
                        disabled={isUpdatePending}
                        title="Tolak"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(reg.id)}
                      title="Hapus"
                    >
                      🗑
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRegistrations.length === 0 && (
          <div className={styles.emptyState}>
            Tidak ada registrasi yang ditemukan.
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus registrasi ini?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button 
                className={styles.deleteConfirmBtn}
                onClick={confirmDelete}
                disabled={isDeletePending}
              >
                {isDeletePending ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {showPhotoModal && (
        <div className={styles.photoModalOverlay} onClick={closePhotoModal}>
          <div className={styles.photoModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closePhotoBtn} onClick={closePhotoModal}>
              ×
            </button>
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Foto KTP" 
                className={styles.photoImage}
                onError={(e) => {
                  console.error('Failed to load image:', photoUrl);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <div style={{display: 'none', color: 'white', textAlign: 'center'}}>
              <p>Gagal memuat foto</p>
              <p style={{fontSize: '0.8rem', color: '#aaa'}}>{photoUrl}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
