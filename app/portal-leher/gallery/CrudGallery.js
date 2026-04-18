'use client';
import { useState, useRef, useEffect } from 'react';
import { useActionState } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/src/css/cropper.css';
import { addGalleryItem, deleteGalleryItem } from './actions';
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
  const [mediaType, setMediaType] = useState('IMAGE');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1]); // Default 4:3
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [drivePickerOpen, setDrivePickerOpen] = useState(false);
  const [driveFiles, setDriveFiles] = useState([]);
  const [loadingDriveFiles, setLoadingDriveFiles] = useState(false);
  const [drivePageToken, setDrivePageToken] = useState(null);
  const [loadingMoreDrive, setLoadingMoreDrive] = useState(false);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const formRef = useRef(null);
  const cropperRef = useRef(null);

  // Reset form setelah upload success
  useEffect(() => {
    if (state?.success) {
      // Reset semua state
      setMediaType('IMAGE');
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
    setMediaType('IMAGE');
    setPreviewUrl(null);
    setCroppedImage(null);
    setAspectRatio(ASPECT_RATIOS[1]);
    setThumbnailPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
    if (formRef.current) formRef.current.reset();
  };

  const loadDriveFiles = async (pageToken = null, append = false) => {
    if (!append) {
      setLoadingDriveFiles(true);
    } else {
      setLoadingMoreDrive(true);
    }
    try {
      // Use the new endpoint that fetches ALL images from Google Drive
      const url = pageToken 
        ? `/api/portal-leher/gallery/drive-images?pageToken=${pageToken}`
        : '/api/portal-leher/gallery/drive-images';
      const response = await fetch(url);
      const data = await response.json();
      
      if (append) {
        setDriveFiles(prev => [...prev, ...(data.files || [])]);
      } else {
        setDriveFiles(data.files || []);
      }
      setDrivePageToken(data.nextPageToken || null);
    } catch (error) {
      console.error('Error loading drive files:', error);
    } finally {
      setLoadingDriveFiles(false);
      setLoadingMoreDrive(false);
    }
  };

  const handleDrivePickerOpen = () => {
    setDrivePickerOpen(true);
    loadDriveFiles();
  };

  const handleDriveFileSelect = (file) => {
    // Use the thumbnail URL from Google Drive
    setPreviewUrl(file.thumbnailUrl);
    // Store the drive file info for later use
    window.selectedDriveFile = file;
    setDrivePickerOpen(false);
    // Reset drive files to free memory
    setDriveFiles([]);
    setDrivePageToken(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setState(null);
    
    try {
      const formData = new FormData(e.target);
      
      // Check if image is from Google Drive
      const driveFile = window.selectedDriveFile;
      if (mediaType === 'IMAGE' && driveFile && !croppedImage) {
        // Download image from Google Drive and convert to File
        const response = await fetch(driveFile.thumbnailUrl);
        const blob = await response.blob();
        const file = new File([blob], driveFile.name || 'drive-image.jpg', { type: blob.type });
        formData.set('imageFile', file);
        // Clear the selected drive file
        delete window.selectedDriveFile;
      }
      // For IMAGE type, use cropped image if available
      else if (mediaType === 'IMAGE' && croppedImage) {
        const croppedFile = dataURLtoFile(croppedImage, 'gallery-image.jpg');
        formData.set('imageFile', croppedFile);
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
        <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.inputGroup}>
              <label>Tipe Media</label>
              <select 
                name="type" 
                value={mediaType} 
                onChange={handleTypeChange}
                required
              >
                <option value="IMAGE">Foto (Upload File)</option>
                <option value="VIDEO">Video (YouTube URL)</option>
              </select>
            </div>
          </div>
          
          {mediaType === 'IMAGE' ? (
            <div className={styles.inputGroup} style={{marginTop:'1rem'}}>
              <label>Upload Gambar</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleDrivePickerOpen}
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  📁 Pilih dari Google Drive
                </button>
              </div>
              {!previewUrl && (
                <>
                  <div style={{ textAlign: 'center', color: '#999', fontSize: '0.85rem', margin: '0.5rem 0' }}>
                    atau upload file dari komputer
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    name="imageFile" 
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                  />
                </>
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
            <button type="submit" className={styles.addBtn} disabled={isPending || (mediaType === 'IMAGE' && !croppedImage && !previewUrl)}>
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
                  src={item.type === 'VIDEO' ? (item.thumbnail || `https://img.youtube.com/vi/${item.url}/0.jpg`) : item.url}
                  alt="Gallery item"
                />
                <div className={styles.thumbLabel}>
                  {item.type === 'VIDEO' ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                      </svg>
                      Video
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      Foto
                    </>
                  )}
                </div>
                <div className={styles.galleryActions}>
                  <button 
                    type="button" 
                    className={styles.deleteOverlay}
                    onClick={() => openDeleteModal(item)}
                    title="Hapus"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Google Drive Picker Modal */}
      {drivePickerOpen && (
        <div 
          className={styles.imageModalOverlay}
          onClick={() => setDrivePickerOpen(false)}
        >
          <div 
            className={styles.imageModalContent}
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '98vw',
              maxWidth: '1600px',
              maxHeight: '98vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--primary)' }}>
                📁 Pilih Foto dari Google Drive ({driveFiles.length} foto)
              </h3>
              <button 
                className={styles.imageModalCloseBtn} 
                onClick={() => setDrivePickerOpen(false)}
              >
                ✕
              </button>
            </div>
            
            <div style={{ 
              padding: '1.5rem',
              flex: 1,
              overflow: 'auto'
            }}>
              {loadingDriveFiles ? (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.25rem'
                }}>
                  {/* Skeleton loaders */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '2px solid #e9ecef',
                      padding: '0.75rem',
                    }}>
                      <div style={{
                        width: '100%',
                        height: '160px',
                        borderRadius: '8px',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        marginBottom: '0.5rem',
                      }} />
                      <div style={{
                        height: '16px',
                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        borderRadius: '4px',
                        width: '80%',
                      }} />
                    </div>
                  ))}
                </div>
              ) : driveFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>
                  <p>Tidak ada foto di Google Drive</p>
                </div>
              ) : (
                <>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.25rem'
                  }}>
                    {driveFiles.map((file) => (
                      <div
                        key={file.id}
                        onClick={() => handleDriveFileSelect(file)}
                        style={{
                          background: 'white',
                          borderRadius: '12px',
                          border: '2px solid #e9ecef',
                          padding: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#e9ecef';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: '160px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginBottom: '0.5rem',
                          background: '#f0f0f0',
                          position: 'relative',
                        }}>
                          <img 
                            src={file.thumbnailUrl} 
                            alt={file.name}
                            loading="lazy"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                            }}
                            onLoad={(e) => {
                              e.target.style.opacity = 1;
                            }}
                            onError={(e) => {
                              // Show placeholder on error
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:0.8rem;">⚠️ Gagal load</div>';
                            }}
                          />
                        </div>
                        <div style={{
                          fontSize: '0.85rem',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {file.name}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {drivePageToken && (
                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '2rem',
                      paddingTop: '1.5rem',
                      borderTop: '1px solid #eee'
                    }}>
                      <button
                        onClick={() => loadDriveFiles(drivePageToken, true)}
                        disabled={loadingMoreDrive}
                        style={{
                          padding: '0.75rem 2rem',
                          background: loadingMoreDrive ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: loadingMoreDrive ? 'not-allowed' : 'pointer',
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          if (!loadingMoreDrive) e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {loadingMoreDrive ? 'Memuat...' : 'Muat Lebih Banyak'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
