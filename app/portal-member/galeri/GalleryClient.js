'use client';
import { useState } from 'react';
import styles from './gallery.module.css';

export default function GalleryClient({ items }) {
  const [activeItem, setActiveItem] = useState(null);

  const getThumbnailUrl = (item) => {
    if (item.type === 'VIDEO') {
      return `https://img.youtube.com/vi/${item.url}/mqdefault.jpg`;
    }
    return item.url;
  };

  return (
    <div className={styles.gallery}>
      <div className={styles.grid}>
        {items.map((item, index) => (
          <div 
            key={index} 
            className={styles.item}
            onClick={() => setActiveItem(item)}
          >
            <img 
              src={getThumbnailUrl(item)} 
              alt={item.title || 'Gallery item'}
              loading="lazy"
            />
            {item.type === 'VIDEO' && (
              <div className={styles.playIcon}>
                <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeItem && (
        <div className={styles.modal} onClick={() => setActiveItem(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setActiveItem(null)}>
              ✕
            </button>
            {activeItem.type === 'VIDEO' ? (
              <iframe
                src={`https://www.youtube.com/embed/${activeItem.url}`}
                title="Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={activeItem.url} alt={activeItem.title || 'Gallery'} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
