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
            {mediaList.map((media, index) => {
              const thumbnailUrl = media.type === 'VIDEO' 
                ? `https://img.youtube.com/vi/${media.url}/0.jpg`
                : media.thumbnail || media.url;
              
              return (
                <div 
                  key={media.id || index} 
                  className={styles.mediaItem} 
                  onClick={() => setActiveMedia(media)}
                >
                  <img 
                    src={thumbnailUrl} 
                    alt={media.title || `Galeri Leher Adventure ${index + 1}`} 
                    loading="lazy"
                    decoding="async"
                  />
                  
                  {media.type === 'VIDEO' && (
                    <div className={styles.playOverlay}>
                      <svg viewBox="0 0 24 24" width="36" height="36" fill="white">
                         <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {activeMedia && (
        <div className={styles.modalOverlay} onClick={() => setActiveMedia(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveMedia(null)}>
               &#x2715;
            </button>
            {activeMedia.type === 'VIDEO' ? (
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${activeMedia.url}`}
                title="Video" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            ) : (
              <img src={activeMedia.url} alt={activeMedia.title || 'Galeri Besar'} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
