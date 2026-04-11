'use client';

import { useState, useTransition } from 'react';
import { useActionState } from 'react';
import { createExpense, updateExpense, deleteExpense } from './actions';
import styles from '../crud.module.css';

const CATEGORY_LABELS = {
  LOGISTICS: 'Logistik & Makanan',
  SIMAKSI: 'Simaksi',
  TRANSPORTATION: 'Transportasi',
  EQUIPMENT_RENTAL: 'Sewa Alat',
  OTHER: 'Lainnya'
};

const CATEGORY_COLORS = {
  LOGISTICS: '#3498db',
  SIMAKSI: '#e74c3c',
  TRANSPORTATION: '#f39c12',
  EQUIPMENT_RENTAL: '#1abc9c',
  OTHER: '#95a5a6'
};

export default function KeuanganClient({ expenses, journeys, stats }) {
  const [selectedJourney, setSelectedJourney] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [createState, createAction] = useActionState(createExpense, null);
  const [updateState, updateAction] = useActionState(updateExpense, null);
  const [deleteState, deleteAction] = useActionState(deleteExpense, null);

  const [isCreatePending, startCreateTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    if (selectedJourney && exp.journeyId !== selectedJourney) return false;
    if (selectedCategory && exp.category !== selectedCategory) return false;
    return true;
  });

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
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

  const handleFormSubmit = (formData) => {
    startCreateTransition(() => {
      if (editingExpense) {
        formData.append('id', editingExpense.id);
        updateAction(formData);
      } else {
        createAction(formData);
      }
      setShowForm(false);
      setEditingExpense(null);
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryBadge = (category) => {
    return (
      <span 
        className={styles.categoryBadge}
        style={{ backgroundColor: CATEGORY_COLORS[category] + '20', color: CATEGORY_COLORS[category] }}
      >
        {CATEGORY_LABELS[category]}
      </span>
    );
  };

  // Calculate filtered totals
  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Keuangan & Pengeluaran</h1>
        <button 
          className={styles.addBtn}
          onClick={() => { setShowForm(true); setEditingExpense(null); }}
        >
          + Tambah Pengeluaran
        </button>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statNumber}>{stats.count}</span>
          <span className={styles.statLabel}>Total Transaksi</span>
        </div>
        <div className={`${styles.statCard} ${styles.statMoney}`}>
          <span className={styles.statNumber}>{formatCurrency(stats.total)}</span>
          <span className={styles.statLabel}>Total Pengeluaran</span>
        </div>
        <div className={`${styles.statCard} ${styles.statMoney}`}>
          <span className={styles.statNumber}>{formatCurrency(filteredTotal)}</span>
          <span className={styles.statLabel}>Filter Terpilih</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className={styles.categoryBreakdown}>
        <h3>Breakdown per Kategori</h3>
        <div className={styles.categoryGrid}>
          {Object.entries(stats.byCategory).map(([cat, amount]) => (
            <div key={cat} className={styles.categoryItem}>
              <span 
                className={styles.categoryDot}
                style={{ backgroundColor: CATEGORY_COLORS[cat] }}
              ></span>
              <span className={styles.categoryName}>{CATEGORY_LABELS[cat]}</span>
              <span className={styles.categoryAmount}>{formatCurrency(amount)}</span>
            </div>
          ))}
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
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Semua Kategori</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      {createState?.success && <div className={styles.success}>{createState.success}</div>}
      {createState?.error && <div className={styles.error}>{createState.error}</div>}
      {updateState?.success && <div className={styles.success}>{updateState.success}</div>}
      {updateState?.error && <div className={styles.error}>{updateState.error}</div>}
      {deleteState?.success && <div className={styles.success}>{deleteState.success}</div>}
      {deleteState?.error && <div className={styles.error}>{deleteState.error}</div>}

      {/* Expenses Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Pendakian</th>
              <th>Jumlah</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map((exp) => (
              <tr key={exp.id}>
                <td>{new Date(exp.date).toLocaleDateString('id-ID')}</td>
                <td>
                  <div className={styles.expenseTitle}>
                    <strong>{exp.title}</strong>
                    {exp.description && <small>{exp.description}</small>}
                  </div>
                </td>
                <td>{getCategoryBadge(exp.category)}</td>
                <td>
                  {exp.journey ? `${exp.journey.mountain?.name} (${exp.journey.year})` : '-'}
                </td>
                <td className={styles.amountCell}>{formatCurrency(exp.amount)}</td>
                <td>
                  <div className={styles.actionGroup}>
                    <button
                      className={`${styles.iconBtn} ${styles.editBtn}`}
                      onClick={() => handleEdit(exp)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.danger}`}
                      onClick={() => handleDelete(exp.id)}
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExpenses.length === 0 && (
          <div className={styles.emptyState}>
            Tidak ada pengeluaran yang ditemukan.
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.formModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</h3>
              <button className={styles.closeBtn} onClick={() => { setShowForm(false); setEditingExpense(null); }}>×</button>
            </div>
            <form action={handleFormSubmit} className={styles.expenseForm}>
              <div className={styles.formGroup}>
                <label>Tanggal</label>
                <input 
                  type="date" 
                  name="date"
                  defaultValue={editingExpense ? new Date(editingExpense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Judul</label>
                <input 
                  type="text" 
                  name="title"
                  placeholder="Judul pengeluaran"
                  defaultValue={editingExpense?.title || ''}
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Kategori</label>
                <select name="category" defaultValue={editingExpense?.category || ''} required>
                  <option value="">Pilih Kategori</option>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Jumlah (Rp)</label>
                <input 
                  type="number" 
                  name="amount"
                  placeholder="0"
                  defaultValue={editingExpense?.amount || ''}
                  min="1"
                  required 
                />
              </div>

              <div className={styles.formGroup}>
                <label>Pendakian (Opsional)</label>
                <select name="journeyId" defaultValue={editingExpense?.journeyId || ''}>
                  <option value="">Pilih Pendakian</option>
                  {journeys.map(journey => (
                    <option key={journey.id} value={journey.id}>
                      {journey.mountain?.name} ({journey.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Keterangan (Opsional)</label>
                <textarea 
                  name="description"
                  placeholder="Keterangan tambahan"
                  defaultValue={editingExpense?.description || ''}
                  rows="2"
                />
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn}
                  onClick={() => { setShowForm(false); setEditingExpense(null); }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isCreatePending}
                >
                  {isCreatePending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Konfirmasi Hapus</h3>
            <p>Apakah Anda yakin ingin menghapus pengeluaran ini?</p>
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
