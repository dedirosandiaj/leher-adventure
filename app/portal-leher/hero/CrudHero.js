'use client';
import { useState, useRef, useEffect } from 'react';
import { deleteHeroSlide } from './actions';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../crud.module.css';

export default function CrudHero({ slides }) {
  const [state, setState] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // Reset form setelah upload success
  useEffect(() => {
    if (state?.success) {
      // Reset preview
      setPreviewUrl(null);
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Reset form
      if (formRef.current) formRef.current.reset();
      
      // Refresh page to show new slide
      window.location.reload();
    }
  }, [state?.success]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCancel = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (formRef.current) formRef.current.reset();
  };

  const openDeleteModal = (slide) => {
    setSlideToDelete(slide);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSlideToDelete(null);
  };

  const confirmDelete = async () => {
    if (slideToDelete) {
      await deleteHeroSlide(slideToDelete.id);
      closeModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setState(null);
    
    try {
      const formData = new FormData(formRef.current);
      
      const response = await fetch('/api/hero/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setState(result);
    } catch (err) {
      setState({ error: 'Gagal upload: ' + err.message });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Hero Slides</h1>

      {/* Form Upload Gambar */}
      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Tambah Slide Baru</h2>
        <form ref={formRef} onSubmit={handleSubmit} encType="multipart/form-data" className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label>Upload Gambar</label>
              <input 
                ref={fileInputRef}
                type="file" 
                name="imageFile" 
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              {previewUrl && (
                <div className={styles.imagePreview}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{maxWidth: '300px', maxHeight: '150px', marginTop: '10px', borderRadius: '8px', objectFit: 'cover'}}
                  />
                </div>
              )}
            </div>
          </div>
          
          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.success && <p className={styles.success}>{state.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Tambah Slide'}
            </button>
            {previewUrl && <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Batal</button>}
          </div>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Daftar Slides ({slides.length})</h2>
        {slides.length === 0 ? (
          <p className={styles.empty}>Belum ada slide. Tambahkan di atas.</p>
        ) : (
          <div className={styles.galleryGrid}>
            {slides.map(slide => (
              <div key={slide.id} className={styles.galleryThumb}>
                <img src={slide.image} alt="Hero slide" />
                <div className={styles.galleryActions}>
                  <button 
                    type="button" 
                    className={styles.deleteOverlay}
                    onClick={() => openDeleteModal(slide)}
                  >
                    ✕
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
        title="Hapus Slide"
        message="Yakin ingin menghapus slide ini? Gambar juga akan terhapus dari server."
      />
    </div>
  );
}
