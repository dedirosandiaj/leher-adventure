'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { registerJourney, getJourneyExpenses } from './actions';
import styles from './home.module.css';

const CATEGORY_LABELS = {
  LOGISTICS: 'Logistik & Makanan',
  SIMAKSI: 'Simaksi',
  TRANSPORTATION: 'Transportasi',
  EQUIPMENT_RENTAL: 'Sewa Alat',
  OTHER: 'Lainnya'
};

export default function JourneyCard({ journey, equipmentProgress, registrationStatus }) {
  const [showModal, setShowModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState(null);
  const [loadingExpense, setLoadingExpense] = useState(false);
  const [state, formAction, isPending] = useActionState(registerJourney, null);

  // Reload page setelah pendaftaran berhasil
  useEffect(() => {
    if (state?.success) {
      window.location.reload();
    }
  }, [state]);

  const canRegister = equipmentProgress >= 100;
  const isRegistered = !!registrationStatus;
  const isApproved = registrationStatus === 'APPROVED';

  const handleClose = () => {
    setShowModal(false);
  };

  const handleViewExpense = async () => {
    setLoadingExpense(true);
    setShowExpenseModal(true);
    try {
      const data = await getJourneyExpenses(journey.id);
      setExpenseData(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
    setLoadingExpense(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <div className={styles.journeyCard}>
        <span className={styles.journeyYear}>{journey.year}</span>
        <span className={styles.mountainName}>{journey.mountain?.name}</span>
        <span className={styles.journeyStatus}>{journey.status}</span>
        
        {isApproved ? (
          <div className={styles.approvedActions}>
            <div className={styles.approvedBadge}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Diterima
            </div>
            <button
              className={styles.expenseBtn}
              onClick={handleViewExpense}
            >
              Detail Biaya
            </button>
          </div>
        ) : isRegistered ? (
          <div className={styles.registeredBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {registrationStatus === 'PENDING' ? 'Menunggu Konfirmasi' : 'Ditolak'}
          </div>
        ) : (
          <button
            className={`${styles.joinButton} ${!canRegister ? styles.disabled : ''}`}
            onClick={() => canRegister && setShowModal(true)}
            disabled={!canRegister}
            title={!canRegister ? 'Lengkapi perlengkapan wajib terlebih dahulu' : 'Daftar pendakian'}
          >
            {canRegister ? 'Saya Ikut' : `Perlengkapan ${equipmentProgress}%`}
          </button>
        )}
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Daftar Pendakian</h3>
              <button className={styles.closeBtn} onClick={handleClose}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.journeyInfo}>
                <strong>{journey.mountain?.name}</strong> - {journey.year}
              </p>
              
              <form action={formAction} className={styles.registrationForm}>
                <input type="hidden" name="journeyId" value={journey.id} />
                
                <div className={styles.formGroup}>
                  <label>Nomor HP</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    placeholder="08xxxxxxxxxx"
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="email@example.com"
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Nomor KTP</label>
                  <input 
                    type="text" 
                    name="ktpNumber" 
                    placeholder="3275xxxxxxxxxxxx"
                    required 
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Foto KTP</label>
                  <input 
                    type="file" 
                    name="ktpPhoto" 
                    accept="image/*"
                    required 
                  />
                  <small>Upload foto KTP Anda (JPG/PNG)</small>
                </div>

                {state?.error && (
                  <div className={styles.error}>{state.error}</div>
                )}
                {state?.success && (
                  <div className={styles.success}>{state.success}</div>
                )}

                <div className={styles.modalActions}>
                  <button 
                    type="button" 
                    className={styles.cancelBtn}
                    onClick={handleClose}
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className={styles.submitBtn}
                    disabled={isPending}
                  >
                    {isPending ? 'Mendaftar...' : 'Daftar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expense Detail Modal */}
      {showExpenseModal && (
        <div className={styles.modalOverlay} onClick={() => setShowExpenseModal(false)}>
          <div className={styles.expenseModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Detail Biaya</h3>
              <button className={styles.closeBtn} onClick={() => setShowExpenseModal(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <p className={styles.journeyInfo}>
                <strong>{journey.mountain?.name}</strong> - {journey.year}
              </p>

              {loadingExpense ? (
                <div className={styles.loading}>Memuat data...</div>
              ) : expenseData ? (
                <>
                  {/* Summary */}
                  <div className={styles.expenseSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Total Pengeluaran</span>
                      <span className={styles.summaryValue}>{formatCurrency(expenseData.total)}</span>
                    </div>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryLabel}>Peserta Diterima</span>
                      <span className={styles.summaryValue}>{expenseData.approvedCount} orang</span>
                    </div>
                    <div className={`${styles.summaryItem} ${styles.highlight}`}>
                      <span className={styles.summaryLabel}>Biaya per Orang</span>
                      <span className={styles.summaryValue}>{formatCurrency(expenseData.costPerMember)}</span>
                    </div>
                  </div>

                  {/* Expense List */}
                  {expenseData.expenses.length > 0 && (
                    <div className={styles.expenseList}>
                      <h4>Rincian Pengeluaran</h4>
                      {expenseData.expenses.map((expense, index) => (
                        <div key={expense.id || index} className={styles.expenseItem}>
                          <div className={styles.expenseInfo}>
                            <span className={styles.expenseTitle}>{expense.title}</span>
                            <span className={styles.expenseCategory}>{CATEGORY_LABELS[expense.category]}</span>
                          </div>
                          <span className={styles.expenseAmount}>{formatCurrency(expense.amount)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {expenseData.expenses.length === 0 && (
                    <div className={styles.noExpense}>
                      Belum ada data pengeluaran
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.error}>Gagal memuat data</div>
              )}

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.submitBtn}
                  onClick={() => setShowExpenseModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
