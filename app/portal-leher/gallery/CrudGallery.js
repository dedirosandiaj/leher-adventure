'use client';
import { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/src/css/cropper.css';
import { deleteGalleryItem } from './actions';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../crud.module.css';

const ASPECT_RATIOS = [
  { label: '1:1 (Square)', value: 1, width: 800, height: 800 },
  { label: '4:3 (Foto)', value: 4/3, width: 800, height: 600 },
  { label: '16:9 (Video)', value: 16/9, width: 1280, height: 720 },
  { label: '3:2', value: 1.5, width: 900, height: 600 },
  { label: '2:1', value: 2, width: 1200, height: 600 },
  { label: '3:1 (Banner)', value: 3, width: 1200, height: 400 },
  { label: 'Bebas', value: NaN, width: 1200, height: 800 },
];

export default function CrudGallery({ items }) {
  const [state, setState] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [mediaType, setMediaType] = useState('image');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1]); // Default 4:3
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const formRef = useRef(null);
  const cropperRef = useRef(null);

  // Reset form setelah upload success
  useEffect(() => {
    if (state?.success) {
      // Reset semua state
      setMediaType('image');
      setPreviewUrl(null);
      setCroppedImage(null);
      setAspectRatio(ASPECT_RATIOS[1]);
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
    setCroppedImage(null);
    setAspectRatio(ASPECT_RATIOS[1]);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (formRef.current) formRef.current.reset();
  };

  const handleCrop = () => {
    if (cropperRef.current) {
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: aspectRatio.width,
        height: aspectRatio.height,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });
      setCroppedImage(canvas.toDataURL('image/jpeg', 0.95));
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setModalOpen(true);
  };

  const handleImageSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setState(null);
    
    try {
      const formData = new FormData();
      formData.append('title', 'Gambar');
      
      // Gunakan gambar yang sudah di-crop jika ada
      if (croppedImage) {
        const croppedFile = dataURLtoFile(croppedImage, 'gallery-image.jpg');
        formData.append('imageFile', croppedFile);
      } else if (previewUrl) {
        const fileInput = fileInputRef.current;
        if (fileInput?.files[0]) {
          formData.append('imageFile', fileInput.files[0]);
        }
      }
      
      const response = await fetch('/api/portal-leher/gallery/upload', {
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
        <form ref={formRef} onSubmit={handleImageSubmit} className={styles.form}>
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
              {!previewUrl && (
                <input 
                  ref={fileInputRef}
                  type="file" 
                  name="imageFile" 
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              )}
              
              {previewUrl && !croppedImage && (
                <div className={styles.cropperWrapper}>
                  <p className={styles.cropHint}>Pilih rasio dan sesuaikan area foto:</p>
                  <div className={styles.aspectRatioSelector}>
                    {ASPECT_RATIOS.map((ratio) => (
                      <button
                        key={ratio.label}
                        type="button"
                        onClick={() => {
                          setAspectRatio(ratio);
                          if (cropperRef.current) {
                            cropperRef.current.cropper.setAspectRatio(ratio.value);
                          }
                        }}
                        className={`${styles.ratioButton} ${aspectRatio.label === ratio.label ? styles.ratioButtonActive : ''}`}
                      >
                        {ratio.label}
                      </button>
                    ))}
                  </div>
                  <Cropper
                    src={previewUrl}
                    style={{ height: 280, width: '100%' }}
                    initialAspectRatio={aspectRatio.value}
                    aspectRatio={aspectRatio.value}
                    guides={true}
                    ref={cropperRef}
                    viewMode={1}
                    dragMode="move"
                    scalable={true}
                    zoomable={true}
                  />
                  <button 
                    type="button" 
                    onClick={handleCrop}
                    className={styles.cropButton}
                  >
                    ✓ Terapkan Crop ({aspectRatio.label.split(' ')[0]})
                  </button>
                </div>
              )}
              
              {croppedImage && (
                <div className={styles.cropperWrapper} style={{textAlign: 'center'}}>
                  <p className={styles.previewLabel}>Preview hasil crop:</p>
                  <img 
                    src={croppedImage} 
                    alt="Cropped preview" 
                    style={{maxWidth: '300px', maxHeight: '200px', margin: '10px auto', borderRadius: '8px', display: 'block'}}
                  />
                  <button 
                    type="button" 
                    onClick={() => setCroppedImage(null)}
                    className={styles.recropButton}
                  >
                    ✎ Ulangi Crop
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.inputGroup} style={{marginTop:'1rem'}}>
              <label>YouTube Video ID</label>
              <input type="text" name="url" placeholder="Contoh: dQw4w9WgXcQ" required />
              <small style={{color: '#666', marginTop: '0.25rem', display: 'block'}}>
                Thumbnail akan diambil otomatis dari YouTube
              </small>
            </div>
          )}
          
          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.success && <p className={styles.success}>{state.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending || (mediaType === 'image' && !croppedImage && !previewUrl)}>
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
                  src={item.type === 'video' ? (item.thumbnail || `https://img.youtube.com/vi/${item.image}/0.jpg`) : item.image}
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
