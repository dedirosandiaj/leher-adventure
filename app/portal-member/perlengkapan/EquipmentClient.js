'use client';

import { useState } from 'react';
import styles from './perlengkapan.module.css';

export default function EquipmentClient({ equipmentItems, memberEquipment, toggleEquipment }) {
  const [checklist, setChecklist] = useState(memberEquipment);
  const [loadingId, setLoadingId] = useState(null);

  // Group items by category name
  const groupedItems = equipmentItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Lainnya';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  const handleToggle = async (itemId, currentChecked) => {
    const newChecked = !currentChecked;
    setLoadingId(itemId);
    
    // Optimistic update - update UI immediately
    setChecklist(prev => {
      const updated = { ...prev };
      if (newChecked) {
        updated[itemId] = true;
      } else {
        delete updated[itemId];
      }
      return updated;
    });
    
    // Server update
    try {
      const result = await toggleEquipment(itemId, newChecked);
      
      if (!result.success) {
        // Revert on error
        setChecklist(prev => {
          const reverted = { ...prev };
          if (currentChecked) {
            reverted[itemId] = true;
          } else {
            delete reverted[itemId];
          }
          return reverted;
        });
      }
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setLoadingId(null);
    }
  };

  // Calculate progress - hanya hitung item yang wajib
  const requiredItems = equipmentItems.filter(item => item.required);
  const totalRequired = requiredItems.length;
  const checkedRequired = requiredItems.filter(item => checklist[item.id]).length;
  const progress = totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 0;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Perlengkapan Mendaki</h1>
      <p className={styles.subtitle}>
        Kelola checklist perlengkapan pribadi Anda
      </p>

      {/* Progress Bar - hanya untuk item wajib */}
      <div className={styles.progressContainer}>
        <div className={styles.progressHeader}>
          <span>Progress Perlengkapan Wajib</span>
          <span>{checkedRequired} / {totalRequired} item wajib</span>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressPercent}>{progress}%</div>
      </div>

      <div className={styles.legend}>
        <span className={styles.required}>
          <span className={styles.badgeRequired}>Wajib</span> Harus dibawa
        </span>
        <span className={styles.optional}>
          <span className={styles.badgeOptional}>Opsional</span> Disarankan
        </span>
      </div>

      <div className={styles.equipmentList}>
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className={styles.category}>
            <h2 className={styles.categoryTitle}>{category}</h2>
            <div className={styles.items}>
              {items.map((item) => {
                const isChecked = checklist[item.id] || false;
                const isLoading = loadingId === item.id;
                
                return (
                  <div 
                    key={item.id} 
                    className={`${styles.item} ${isChecked ? styles.checked : ''} ${isLoading ? styles.loading : ''}`}
                    onClick={() => {
                      if (!isLoading) {
                        const currentValue = checklist[item.id] || false;
                        handleToggle(item.id, currentValue);
                      }
                    }}
                  >
                    <div className={styles.checkbox}>
                      {isChecked && (
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </div>
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemName}>{item.name}</span>
                        {item.required ? (
                          <span className={styles.badgeRequired}>Wajib</span>
                        ) : (
                          <span className={styles.badgeOptional}>Opsional</span>
                        )}
                      </div>
                      <p className={styles.itemDescription}>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.tips}>
        <h3>Tips Penting:</h3>
        <ul>
          <li>Centang item yang sudah Anda miliki</li>
          <li>Prioritaskan perlengkapan yang bertanda Wajib</li>
        </ul>
      </div>
    </div>
  );
}
