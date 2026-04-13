'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { updateRegistrationStatus, deleteRegistration } from './actions';
import styles from '../crud.module.css';
import * as XLSX from 'xlsx';

export default function RegistrasiClient({ registrations, journeys, stats }) {
  const [selectedJourney, setSelectedJourney] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Download Report to Excel
  const handleDownloadReport = () => {
    if (filteredRegistrations.length === 0) {
      alert('Tidak ada data untuk di-download');
      return;
    }

    // Sheet 1: Member Data
    const memberData = filteredRegistrations.map((reg, index) => ({
      'No': index + 1,
      'Nama Member': reg.user?.name || reg.user?.username,
      'Username': reg.user?.username,
      'Pendakian': reg.journey?.mountain?.name,
      'Tahun': reg.journey?.year,
      'Nomor HP': reg.phone,
      'Email': reg.email,
      'Biaya per Orang': reg.status === 'APPROVED' && reg.costPerMember > 0 ? reg.costPerMember : 0,
      'Status': reg.status === 'APPROVED' ? 'Diterima' : reg.status === 'REJECTED' ? 'Ditolak' : 'Menunggu',
      'Tanggal Daftar': new Date(reg.createdAt).toLocaleDateString('id-ID'),
    }));

    // Sheet 2: Rincian Biaya (list semua pengeluaran)
    const expenseData = [];
    const journeyExpenses = {};
    
    // Group expenses by journey
    filteredRegistrations.forEach(reg => {
      if (!journeyExpenses[reg.journeyId]) {
        journeyExpenses[reg.journeyId] = {
          journey: reg.journey,
          expenses: reg.journey?.expenses || [],
          approvedCount: 0,
          members: []
        };
      }
      if (reg.status === 'APPROVED') {
        journeyExpenses[reg.journeyId].approvedCount += 1;
        journeyExpenses[reg.journeyId].members.push(reg.user?.name || reg.user?.username);
      }
    });

    // Add expense list for each journey
    Object.values(journeyExpenses).forEach(item => {
      // Header row for journey
      expenseData.push({
        'Kategori': `${item.journey?.mountain?.name} (${item.journey?.year})`,
        'Judul': '',
        'Jumlah': ''
      });
      
      // List all expenses - Kategori, Judul dan Jumlah
      if (item.expenses && item.expenses.length > 0) {
        item.expenses.forEach(exp => {
          expenseData.push({
            'Kategori': exp.category,
            'Judul': exp.title,
            'Jumlah': exp.amount
          });
        });
        
        // Add total row
        const total = item.expenses.reduce((sum, e) => sum + e.amount, 0);
        expenseData.push({
          'Kategori': 'TOTAL',
          'Judul': '',
          'Jumlah': total
        });
      }
      
      // Empty row as separator
      expenseData.push({
        'Kategori': '',
        'Judul': '',
        'Jumlah': ''
      });
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add Sheet 1: Member
    const ws1 = XLSX.utils.json_to_sheet(memberData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Member');
    
    // Add Sheet 2: Rincian Biaya
    const ws2 = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Rincian Biaya');

    // Download
    const fileName = `Report_Registrasi_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Kelola Registrasi Pendakian</h1>
        <button 
          className={styles.downloadBtn}
          onClick={handleDownloadReport}
          disabled={filteredRegistrations.length === 0}
        >
          📥 Download Report
        </button>
      </div>

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
              <th>Biaya per Orang</th>
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
                  {reg.status === 'APPROVED' && reg.costPerMember > 0 ? (
                    <span className={styles.costValue}>{formatCurrency(reg.costPerMember)}</span>
                  ) : (
                    <span className={styles.costEmpty}>-</span>
                  )}
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


    </div>
  );
}
