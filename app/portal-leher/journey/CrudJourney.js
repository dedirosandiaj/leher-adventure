'use client';
import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { addMountain, updateMountain, deleteMountain, moveMountain } from './actions';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from '../crud.module.css';
import Modal from '@/components/Modal';

const STATUSES = ['Rencana', 'Berlangsung', 'Selesai'];

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

// Sortable Mountain Item Component
function SortableMountain({ mountain, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mountain.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.mountainCard}>
      <span className={styles.mountainName}>
        <span {...attributes} {...listeners} className={styles.dragHandle} style={{display: 'inline-flex', marginRight: '8px', cursor: 'grab'}}>
          <DragHandleIcon />
        </span>
        {mountain.name}
      </span>
      <span className={styles.mountainYear}>{mountain.year}</span>
      <button type="button" className={styles.deleteBtnSm} onClick={() => onDelete(mountain)} title="Hapus">✕</button>
    </div>
  );
}

// Status Column Component
function StatusColumn({ status, mountains, onDelete }) {
  const { setNodeRef, isOver } = useSortable({
    id: status,
    data: { type: 'column', status }
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`${styles.statusColumn} ${isOver ? styles.dragOver : ''}`}
    >
      <h3 className={styles.statusHeader}>
        <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          {status}
        </span>
        <span className={styles.countBadge}>{mountains.length}</span>
      </h3>
      <div className={styles.mountainList}>
        <SortableContext items={mountains.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {mountains.map(mountain => (
            <SortableMountain 
              key={mountain.id} 
              mountain={mountain}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function CrudJourney({ mountains: initialMountains }) {
  const [mountains, setMountains] = useState(initialMountains);
  const [activeId, setActiveId] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [addState, addFormAction] = useActionState(addMountain, null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mountainToDelete, setMountainToDelete] = useState(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Group mountains by status
  const mountainsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = mountains.filter(m => m.status === status);
    return acc;
  }, {});

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;

    // Parse IDs to numbers (dnd-kit returns string IDs)
    const activeId = parseInt(active.id);
    const overId = parseInt(over.id);

    const activeMountain = mountains.find(m => m.id === activeId);
    if (!activeMountain) return;

    // Get the status where it was dropped
    let overStatus = null;
    let overMountainId = null;
    
    if (STATUSES.includes(over.id)) {
      overStatus = over.id;
    } else if (!isNaN(overId)) {
      overMountainId = overId;
      const overMountain = mountains.find(m => m.id === overMountainId);
      if (overMountain) {
        overStatus = overMountain.status;
      }
    }

    if (!overStatus) return;

    // Move to different status
    if (overStatus !== activeMountain.status) {
      const updatedMountain = { ...activeMountain, status: overStatus };
      setMountains(mountains.map(m => m.id === activeId ? updatedMountain : m));
      await moveMountain(activeId, overStatus);
      return;
    }

    // Reorder within same status
    if (overMountainId && overMountainId !== activeId) {
      const activeStatus = activeMountain.status;
      const statusMountains = mountainsByStatus[activeStatus];
      const oldIndex = statusMountains.findIndex(m => m.id === activeId);
      const newIndex = statusMountains.findIndex(m => m.id === overMountainId);
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newStatusMountains = arrayMove(statusMountains, oldIndex, newIndex);
        const otherMountains = mountains.filter(m => m.status !== activeStatus);
        setMountains([...otherMountains, ...newStatusMountains]);
      }
    }
  };

  const handleDeleteClick = (mountain) => {
    setMountainToDelete(mountain);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (mountainToDelete) {
      await deleteMountain(mountainToDelete.id);
      setMountains(mountains.filter(m => m.id !== mountainToDelete.id));
      setModalOpen(false);
      setMountainToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setMountainToDelete(null);
  };

  const currentYear = new Date().getFullYear();

  // Render placeholder during SSR
  if (!isClient) {
    return (
      <div>
        <h1 className={styles.pageTitle}>Kelola Jejak Kami</h1>
        <div className={styles.formCard}>
          <h2 className={styles.sectionTitle}>Tambah Gunung</h2>
          <form action={addFormAction} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label>Nama Gunung</label>
                <input type="text" name="name" placeholder="Contoh: Gunung Rinjani" required />
              </div>
              <div className={styles.inputGroup}>
                <label>Tahun</label>
                <input type="number" name="year" placeholder={currentYear} defaultValue={currentYear} min="2000" max="2100" required />
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
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.addBtn}>Tambah</button>
            </div>
          </form>
        </div>
        <div className={styles.listCard}>
          <h2 className={styles.sectionTitle}>Board Ekspedisi</h2>
          <div className={styles.kanbanBoard}>
            {STATUSES.map(status => (
              <div key={status} className={styles.statusColumn}>
                <h3 className={styles.statusHeader}>
                  <span className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>{status}</span>
                  <span className={styles.countBadge}>{mountainsByStatus[status]?.length || 0}</span>
                </h3>
                <div className={styles.mountainList}>
                  {(mountainsByStatus[status] || []).map(mountain => (
                    <div key={mountain.id} className={styles.mountainCard}>
                      <span className={styles.mountainName}>
                        <span style={{display: 'inline-flex', marginRight: '8px'}}>
                          <DragHandleIcon />
                        </span>
                        {mountain.name}
                      </span>
                      <span className={styles.mountainYear}>{mountain.year}</span>
                      <button type="button" className={styles.deleteBtnSm}>✕</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <h2 className={styles.sectionTitle}>Board Ekspedisi (Drag & Drop)</h2>
        <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 9l6 6-6 6"></path>
            <path d="M4 4v7a4 4 0 0 0 4 4h12"></path>
          </svg>
          Drag icon di samping nama gunung untuk ubah status
        </p>
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.kanbanBoard}>
            {STATUSES.map(status => (
              <StatusColumn
                key={status}
                status={status}
                mountains={mountainsByStatus[status]}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <div className={styles.mountainCard}>
                {mountains.find(m => m.id === parseInt(activeId))?.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmDelete}
        title="Konfirmasi Hapus"
        message={mountainToDelete ? `Yakin ingin menghapus "${mountainToDelete.name}"?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
      />
    </div>
  );
}
