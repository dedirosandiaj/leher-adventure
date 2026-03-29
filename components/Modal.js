'use client';
import { useEffect } from 'react';
import styles from './Modal.module.css';

export default function Modal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Ya', cancelText = 'Batal', type = 'confirm' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.content}>
          <p>{message}</p>
        </div>
        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            {cancelText}
          </button>
          {type === 'confirm' && (
            <button className={styles.confirmBtn} onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
