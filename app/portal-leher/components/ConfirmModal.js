'use client';
import { useState, useEffect } from 'react';
import styles from './ConfirmModal.module.css';

// Icons
const icons = {
  danger: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  warning: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
  info: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  ),
};

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger',
  requireConfirm = false,
  confirmValue = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsExiting(false);
      setInputValue('');
    } else {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 200);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const isConfirmDisabled = requireConfirm && inputValue !== confirmValue;

  const iconWrapperClass = `${styles.iconWrapper} ${styles[`icon${type.charAt(0).toUpperCase() + type.slice(1)}`]}`;
  const overlayClass = `${styles.modalOverlay} ${isExiting ? styles.modalOverlayExiting : ''}`;
  const modalClass = `${styles.modal} ${isExiting ? styles.modalExiting : ''}`;
  const confirmBtnClass = `${styles.confirmBtn} ${type === 'danger' ? styles.dangerBtn : ''}`;

  return (
    <div className={overlayClass} onClick={handleOverlayClick}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={iconWrapperClass}>
            {icons[type]}
          </div>
          <h3 className={styles.title}>{title || 'Konfirmasi'}</h3>
        </div>
        
        <div className={styles.modalBody}>
          <p className={styles.message}>{message}</p>
          
          {requireConfirm && (
            <div className={styles.dangerZone}>
              <div className={styles.dangerLabel}>Zona Berbahaya</div>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                Ketik <strong>{confirmValue}</strong> untuk konfirmasi:
              </p>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ketik ${confirmValue}`}
                className={styles.confirmInput}
                autoFocus
              />
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={handleClose}>
            {cancelText}
          </button>
          <button 
            className={confirmBtnClass} 
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
