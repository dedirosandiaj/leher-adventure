'use client';
import { useState } from 'react';
import styles from './Gallery.module.css';

export default function Gallery({ items }) {
  const [activeMedia, setActiveMedia] = useState(null);

  const mediaList = items || [];

  return (
    <section id="galeri-kami" className={styles.gallery}>
      <div className="container">
        <h2 className={styles.title}>Galeri Kami</h2>
        <p className={styles.subtitle}>Momen-momen tak terlupakan dari setiap perjalanan dan ekspedisi.</p>
        
        <div className={styles.grid}>
          <div className={styles.mediaGrid}>
            {mediaList.map((media, index) => (
              <div 
                key={index} 
                className={styles.mediaItem} 
                onClick={() => setActiveMedia(media)}
              >
                <img src={media.type === 'video' ? media.thumbnail : media.url} alt={`Galeri Leher Adventure ${index + 1}`} loading="lazy" />
                
                {media.type === 'video' && (
                  <div className={styles.playOverlay}>
                    <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                       <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeMedia && (
        <div className={styles.modalOverlay} onClick={() => setActiveMedia(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveMedia(null)}>
               &#x2715;
            </button>
            {activeMedia.type === 'video' ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeMedia.id}?autoplay=1`}
                title="Youtube Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            ) : (
              <img src={activeMedia.url} alt="Galeri Besar" />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
