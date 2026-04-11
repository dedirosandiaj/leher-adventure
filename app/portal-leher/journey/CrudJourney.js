'use client';
import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { addMountain, deleteMountain, moveMountain } from './actions';
import styles from '../crud.module.css';
import Modal from '@/components/Modal';

const STATUSES = ['Rencana', 'Berlangsung', 'Selesai'];

// Status mapping
const STATUS_MAP = {
  'Rencana': 'PLANNED',
  'Berlangsung': 'ONGOING',
  'Selesai': 'COMPLETED'
};

const STATUS_REVERSE_MAP = {
  'PLANNED': 'Rencana',
  'ONGOING': 'Berlangsung',
  'COMPLETED': 'Selesai'
};

// Drag Handle Icon
const DragHandleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="12" r="1"></circle>
    <circle cx="9" cy="5" r="1"></circle>
    <circle cx="9" cy="19" r="1"></circle>
    <circle cx="15" cy="12" r="1"></circle>
    <circle cx="15" cy="5" r="1"></circle>
    <circle cx="15" cy="19" r="1"></circle>
  </svg>
);

// Journey Card Component
function JourneyCard({ journey, onDelete, isDragging }) {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('journeyId', journey.id);
    e.dataTransfer.setData('mountainId', journey.mountainId);
    e.dataTransfer.setData('currentStatus', journey.status);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className={`${styles.mountainCard} ${isDragging ? styles.dragging : ''} ${isDragOver ? styles.dragOver : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <span className={styles.dragHandle} style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }}>
        <DragHandleIcon />
      </span>
      <span className={styles.mountainName}>
        {journey.mountain?.name}
      </span>
      <span className={styles.mountainYear}>{journey.year}</span>
      <button 
        type="button" 
        className={styles.deleteBtnSm} 
        onClick={() => onDelete(journey)}
        title="Hapus"
      >
        ✕
      </button>
    </div>
  );
}

// Status Column Component
function StatusColumn({ status, journeys, onDrop, onDelete, draggingId }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const journeyId = e.dataTransfer.getData('journeyId');
    const mountainId = e.dataTransfer.getData('mountainId');
    const currentStatus = e.dataTransfer.getData('currentStatus');
    
    if (journeyId && mountainId && currentStatus) {
      onDrop({ journeyId, mountainId, currentStatus, newStatus: status });
    }
  };

  return (
    <div 
      className={`${styles.statusColumn} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className={styles.statusHeader}>
        <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
          {status}
        </span>
        <span className={styles.countBadge}>
          {journeys?.length || 0}
        </span>
      </h3>
      
      <div className={styles.mountainList}>
        {journeys?.map(journey => (
          <JourneyCard 
            key={journey.id} 
            journey={journey}
            onDelete={onDelete}
            isDragging={draggingId === journey.id}
          />
        ))}
      </div>
    </div>
  );
}

export default function CrudJourney({ journeys: initialJourneys }) {
  const [journeys, setJourneys] = useState(initialJourneys || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [journeyToDelete, setJourneyToDelete] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();
  const [addState, addFormAction] = useActionState(addMountain, null);
  
  // Sync with server data
  useEffect(() => {
    setJourneys(initialJourneys || []);
  }, [initialJourneys]);

  // Group journeys by status
  const journeysByStatus = STATUSES.reduce((acc, status) => {
    const englishStatus = STATUS_MAP[status];
    acc[status] = journeys.filter(j => j.status === englishStatus);
    return acc;
  }, {});

  const handleDrop = async ({ mountainId, currentStatus, newStatus }) => {
    const currentEnglishStatus = STATUS_MAP[currentStatus] || currentStatus;
    const newEnglishStatus = STATUS_MAP[newStatus];
    
    // Don't update if same status
    if (currentEnglishStatus === newEnglishStatus) return;
    
    setIsUpdating(true);
    
    // Optimistic update
    setJourneys(prev => prev.map(j => 
      j.mountainId === mountainId 
        ? { ...j, status: newEnglishStatus }
        : j
    ));
    
    // Update database
    await moveMountain(mountainId, newStatus);
    
    // Refresh from server
    router.refresh();
    setIsUpdating(false);
  };

  const handleDeleteClick = (journey) => {
    setJourneyToDelete(journey);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (journeyToDelete) {
      await deleteMountain(journeyToDelete.mountainId);
      router.refresh();
      setModalOpen(false);
      setJourneyToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setJourneyToDelete(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Jejak Kami</h1>

      {/* Add Form */}
      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Tambah Gunung</h2>
        <form action={addFormAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Nama Gunung</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Contoh: Gunung Rinjani" 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Tahun</label>
              <input 
                type="number" 
                name="year" 
                placeholder={currentYear} 
                defaultValue={currentYear}
                min="2000"
                max="2100"
                required 
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select name="status" defaultValue="Rencana">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          
          {addState?.error && <p className={styles.error}>{addState.error}</p>}
          {addState?.success && <p className={styles.success}>{addState.success}</p>}
          
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn}>Tambah</button>
          </div>
        </form>
      </div>

      {/* Kanban Board */}
      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>
          Board Ekspedisi 
          {isUpdating && <span style={{ fontSize: '0.8rem', color: '#666', marginLeft: '1rem' }}>(Updating...)</span>}
        </h2>
        
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
          Drag item menggunakan icon grip ke kolom lain untuk ubah status
        </p>
        
        <div className={styles.kanbanBoard}>
          {STATUSES.map(status => (
            <StatusColumn
              key={status}
              status={status}
              journeys={journeysByStatus[status]}
              onDrop={handleDrop}
              onDelete={handleDeleteClick}
              draggingId={draggingId}
            />
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={journeyToDelete ? `Yakin ingin menghapus "${journeyToDelete.mountain?.name}"?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
}
