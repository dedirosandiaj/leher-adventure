'use client';
import { useActionState, useState, useRef, useEffect } from 'react';
import { addGalleryItem, deleteGalleryItem } from './actions';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../crud.module.css';

export default function CrudGallery({ items }) {
  const [state, formAction, isPending] = useActionState(addGalleryItem, null);
  const [mediaType, setMediaType] = useState('image');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const formRef = useRef(null);

  // Reset form setelah upload success
  useEffect(() => {
    if (state?.success) {
      // Reset semua state
      setMediaType('image');
      setPreviewUrl(null);
      setThumbnailPreview(null);
      
      // Reset file inputs
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
      
      // Reset form
      if (formRef.current) formRef.current.reset();
    }
  }, [state?.success]);

  const handleTypeChange = (e) => {
    setMediaType(e.target.value);
    setPreviewUrl(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleCancel = () => {
    setMediaType('image');
    setPreviewUrl(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (formRef.current) formRef.current.reset();
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteGalleryItem(itemToDelete.id);
      closeModal();
    }
  };

  return (
    <div>
      <h1 className={styles.pageTitle}>Kelola Galeri</h1>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Tambah Item Galeri</h2>
        <form ref={formRef} action={formAction} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Tipe Media</label>
              <select 
                name="type" 
                value={mediaType} 
                onChange={handleTypeChange}
                required
              >
                <option value="image">Foto (Upload File)</option>
                <option value="video">Video (YouTube URL)</option>
              </select>
            </div>
          </div>
          
          {mediaType === 'image' ? (
            <div className={styles.inputGroup} style={{marginTop:'1rem'}}>
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
                    style={{maxWidth: '200px', maxHeight: '150px', marginTop: '10px', borderRadius: '8px'}}
                  />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.inputGroup} style={{marginTop:'1rem'}}>
                <label>YouTube Video ID</label>
                <input type="text" name="url" placeholder="Contoh: dQw4w9WgXcQ" required />
              </div>
              <div className={styles.inputGroup} style={{marginTop:'1rem'}}>
                <label>Upload Thumbnail</label>
                <input 
                  ref={thumbnailInputRef}
                  type="file" 
                  name="thumbnailFile" 
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  required
                />
                {thumbnailPreview && (
                  <div className={styles.imagePreview}>
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail Preview" 
                      style={{maxWidth: '200px', maxHeight: '150px', marginTop: '10px', borderRadius: '8px'}}
                    />
                  </div>
                )}
              </div>
            </>
          )}
          
          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.success && <p className={styles.success}>{state.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending}>
              {isPending ? 'Menyimpan...' : 'Tambah ke Galeri'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Batal</button>
          </div>
        </form>
      </div>

      <div className={styles.listCard}>
        <h2 className={styles.sectionTitle}>Item Galeri Saat Ini ({items.length})</h2>
        {items.length === 0 ? (
          <p className={styles.empty}>Belum ada item di galeri.</p>
        ) : (
          <div className={styles.galleryGrid}>
            {items.map(item => (
              <div key={item.id} className={styles.galleryThumb}>
                <img
                  src={item.type === 'video' ? (item.thumbnail || `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`) : item.url}
                  alt="Gallery item"
                />
                <div className={styles.thumbLabel}>{item.type === 'video' ? '▶ Video' : '🖼 Foto'}</div>
                <div className={styles.galleryActions}>
                  <button 
                    type="button" 
                    className={styles.deleteOverlay}
                    onClick={() => openDeleteModal(item)}
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
        title="Hapus Item Galeri"
        message={itemToDelete?.type === 'image' 
          ? "Yakin ingin menghapus item ini? Gambar juga akan terhapus dari server."
          : "Yakin ingin menghapus video ini?"}
      />
    </div>
  );
}
