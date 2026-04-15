'use client';
import { useState } from 'react';
import styles from './Journey.module.css';

const MountainIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z"></path>
  </svg>
);

const ChevronIcon = ({ isOpen }) => (
  <svg 
    viewBox="0 0 24 24" 
    width="20" 
    height="20" 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

function getStatusLabel(status) {
  const labels = {
    'COMPLETED': 'Selesai',
    'ONGOING': 'Berlangsung',
    'PLANNED': 'Rencana',
    'CANCELLED': 'Dibatalkan'
  };
  return labels[status] || status;
}

function getStatusClass(status) {
  const classes = {
    'COMPLETED': styles.completed,
    'ONGOING': styles.ongoing,
    'PLANNED': styles.planned,
    'CANCELLED': styles.cancelled
  };
  return classes[status] || '';
}

function JourneyAccordion({ item, isOpen, onToggle }) {
  return (
    <div className={`${styles.accordionItem} ${isOpen ? styles.open : ''}`}>
      <button className={styles.accordionHeader} onClick={onToggle}>
        <div className={styles.yearSection}>
          <span className={styles.year}>{item.year}</span>
          <span className={styles.mountainCount}>
            {item.mountains.length} Gunung
          </span>
        </div>
        <ChevronIcon isOpen={isOpen} />
      </button>
      
      {isOpen && (
        <div className={styles.accordionContent}>
          {item.mountains
            .sort((a, b) => {
              // Prioritize PLANNED status
              if (a.journeyStatus === 'PLANNED' && b.journeyStatus !== 'PLANNED') return -1;
              if (a.journeyStatus !== 'PLANNED' && b.journeyStatus === 'PLANNED') return 1;
              return 0;
            })
            .map((m, idx) => (
              <div key={idx} className={styles.mountainRow}>
                <div className={styles.mountainIcon}>
                  <MountainIcon />
                </div>
                <div className={styles.mountainInfo}>
                  <span className={styles.mountainName}>{m.name}</span>
                  <div className={styles.mountainMeta}>
                    {m.location && (
                      <span className={styles.metaItem}>
                        <LocationIcon />
                        {m.location}
                      </span>
                    )}
                    <span className={`${styles.statusBadge} ${getStatusClass(m.journeyStatus)}`}>
                      {getStatusLabel(m.journeyStatus)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default function JourneyClient({ journeys }) {
  const [openYear, setOpenYear] = useState(journeys[0]?.year || null);

  const toggleYear = (year) => {
    setOpenYear(openYear === year ? null : year);
  };

  return (
    <section id="jejak-kami" className={styles.journey}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Jejak Kami</h2>
          <p className={styles.subtitle}>
            Jejak pendakian tim Leher Adventure dari tahun ke tahun
          </p>
        </div>
        
        <div className={styles.accordion}>
          {journeys.map((item) => (
            <JourneyAccordion
              key={item.year}
              item={item}
              isOpen={openYear === item.year}
              onToggle={() => toggleYear(item.year)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
