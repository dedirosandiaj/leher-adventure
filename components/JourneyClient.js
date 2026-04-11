'use client';
import { useState } from 'react';
import styles from './Journey.module.css';

const MountainIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z"></path>
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

function JourneyCard({ item, index, isOpen, onToggle }) {
  return (
    <div className={`${styles.timelineItem} ${isOpen ? styles.active : ''}`}>
      <div className={styles.timelineMarker}>
        <div className={styles.markerIcon}>
          <MountainIcon />
        </div>
        <div className={styles.timelineLine}></div>
      </div>
      
      <div className={styles.card}>
        <button className={styles.cardHeader} onClick={onToggle}>
          <div className={styles.yearBadge}>
            <span className={styles.year}>{item.year}</span>
          </div>
          <div className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`}>
            <ChevronDown />
          </div>
        </button>
        
        <div className={`${styles.cardContent} ${isOpen ? styles.expanded : ''}`}>
          <div className={styles.mountainsGrid}>
            {item.mountains.map((m, idx) => (
              <div key={idx} className={styles.mountainItem}>
                <MountainIcon />
                <span className={styles.mountainName}>{m.name}</span>
                <span className={`${styles.mountainStatus} ${styles[m.journeyStatus?.toLowerCase()]}`}>
                  {m.journeyStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JourneyClient({ journeys }) {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleCard = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="jejak-kami" className={styles.journey}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Jejak Kami</h2>
          <p className={styles.subtitle}>
            Peta petualangan ekspedisi yang telah kita lalui bersama.
          </p>
        </div>
        
        <div className={styles.timeline}>
          {journeys.map((item, index) => (
            <JourneyCard
              key={item.year}
              item={item}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleCard(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
