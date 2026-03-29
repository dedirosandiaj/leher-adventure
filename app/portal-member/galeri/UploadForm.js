'use client';

import { useActionState, useEffect, useState } from 'react';
import { uploadGalleryImage } from './actions';
import styles from './upload.module.css';

export default function UploadForm() {
  const [state, formAction, isPending] = useActionState(uploadGalleryImage, null);
  const [preview, setPreview] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setPreview(null);
      setIsOpen(false);
      // Reset form
      document.getElementById('uploadForm').reset();
      // Refresh page to show new image
      window.location.reload();
    }
  }, [state]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
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
          
          <form id="uploadForm" action={formAction}>
            <input type="hidden" name="title" value="Gambar" />
            
            <div className={styles.inputGroup}>
              <label>Pilih Gambar</label>
              <input 
                type="file" 
                name="image" 
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
                required
              />
            </div>

            {preview && (
              <div className={styles.preview}>
                <img src={preview} alt="Preview" />
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
                onClick={() => setIsOpen(false)}
                className={styles.cancelButton}
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={isPending}
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
