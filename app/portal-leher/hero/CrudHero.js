'use client';
import { useState, useRef, useEffect } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/src/css/cropper.css';
import { deleteHeroSlide } from './actions';
import ConfirmModal from '../components/ConfirmModal';
import styles from '../crud.module.css';

const ASPECT_RATIOS = [
  { label: '16:9 (Wide)', value: 16/9, width: 1920, height: 1080 },
  { label: '21:9 (Ultra)', value: 21/9, width: 1920, height: 822 },
  { label: '3:1 (Banner)', value: 3, width: 1800, height: 600 },
  { label: '2:1', value: 2, width: 1600, height: 800 },
  { label: '4:3', value: 4/3, width: 1200, height: 900 },
  { label: '1:1', value: 1, width: 1000, height: 1000 },
  { label: 'Bebas', value: NaN, width: 1600, height: 1000 },
];

export default function CrudHero({ slides }) {
  const [state, setState] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]); // Default 16:9
  const [modalOpen, setModalOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const cropperRef = useRef(null);

  // Reset form setelah upload success
  useEffect(() => {
    if (state?.success) {
      // Reset preview
      setPreviewUrl(null);
      setCroppedImage(null);
      setAspectRatio(ASPECT_RATIOS[0]);
      
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
    setCroppedImage(null);
    setAspectRatio(ASPECT_RATIOS[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const formData = new FormData();
      
      // Gunakan gambar yang sudah di-crop jika ada
      if (croppedImage) {
        const croppedFile = dataURLtoFile(croppedImage, 'hero-slide.jpg');
        formData.append('imageFile', croppedFile);
      } else if (previewUrl) {
        const fileInput = fileInputRef.current;
        if (fileInput?.files[0]) {
          formData.append('imageFile', fileInput.files[0]);
        }
      }
      
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
                    style={{ height: 300, width: '100%' }}
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
                    style={{maxWidth: '400px', maxHeight: '200px', margin: '10px auto', borderRadius: '8px', objectFit: 'cover', display: 'block'}}
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
          </div>
          
          {state?.error && <p className={styles.error}>{state.error}</p>}
          {state?.success && <p className={styles.success}>{state.success}</p>}
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.addBtn} disabled={isPending || (!croppedImage && !previewUrl)}>
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
