'use client';

import { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/src/css/cropper.css';
import styles from './upload.module.css';

const ASPECT_RATIOS = [
  { label: '1:1 (Square)', value: 1, width: 800, height: 800 },
  { label: '2:1 (Landscape)', value: 2, width: 1200, height: 600 },
  { label: '3:1 (Wide)', value: 3, width: 1200, height: 400 },
  { label: '1:2 (Portrait)', value: 0.5, width: 600, height: 1200 },
  { label: '16:9 (Video)', value: 16/9, width: 1280, height: 720 },
  { label: '4:3 (Foto)', value: 4/3, width: 800, height: 600 },
  { label: 'Bebas', value: NaN, width: 1200, height: 800 },
];

export default function UploadForm() {
  const [preview, setPreview] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[2]); // Default 3:1
  const cropperRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
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
      setCroppedImage(canvas.toDataURL('image/jpeg', 0.9));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setState(null);
    
    try {
      const formData = new FormData();
      formData.append('title', 'Gambar');
      
      // Gunakan gambar yang sudah di-crop jika ada
      if (croppedImage) {
        const croppedFile = dataURLtoFile(croppedImage, 'cropped-image.jpg');
        formData.append('image', croppedFile);
      } else if (preview) {
        // Fallback ke file asli
        const fileInput = document.getElementById('imageInput');
        if (fileInput.files[0]) {
          formData.append('image', fileInput.files[0]);
        }
      }
      
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setState(result);
      
      if (result.success) {
        setPreview(null);
        setCroppedImage(null);
        setIsOpen(false);
        e.target.reset();
        window.location.reload();
      }
    } catch (err) {
      setState({ error: 'Gagal upload: ' + err.message });
    } finally {
      setIsPending(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setPreview(null);
    setCroppedImage(null);
    setAspectRatio(ASPECT_RATIOS[2]); // Reset ke default 3:1
  };

  return (
    <div className={styles.uploadSection}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className={styles.uploadButton}
        >
          <span>+</span> Upload Foto
        </button>
      ) : (
        <div className={styles.formContainer}>
          <h3 className={styles.formTitle}>Upload Foto ke Gallery</h3>
          
          <form id="uploadForm" onSubmit={handleSubmit}>
            <input type="hidden" name="title" value="Gambar" />
            
            {!preview && (
              <div className={styles.inputGroup}>
                <label>Pilih Gambar</label>
                <input 
                  id="imageInput"
                  type="file" 
                  name="image" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                  required
                />
              </div>
            )}

            {preview && !croppedImage && (
              <div className={styles.cropperContainer}>
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
                  src={preview}
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
              <div className={styles.preview}>
                <p className={styles.previewLabel}>Preview hasil crop:</p>
                <img src={croppedImage} alt="Cropped preview" />
                <button 
                  type="button" 
                  onClick={() => setCroppedImage(null)}
                  className={styles.recropButton}
                >
                  ✎ Ulangi Crop
                </button>
              </div>
            )}

            {state?.error && (
              <p className={styles.error}>{state.error}</p>
            )}
            {state?.success && (
              <p className={styles.success}>{state.success}</p>
            )}

            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                onClick={handleCancel}
                className={styles.cancelButton}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isPending || (!croppedImage && !preview)}
                className={styles.submitButton}
              >
                {isPending ? 'Mengupload...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
