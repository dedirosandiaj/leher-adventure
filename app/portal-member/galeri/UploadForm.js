'use client';

import { useState } from 'react';
import styles from './upload.module.css';

export default function UploadForm() {
  const [preview, setPreview] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setState(null);
    
    try {
      const formData = new FormData(e.target);
      
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      setState(result);
      
      if (result.success) {
        setPreview(null);
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
