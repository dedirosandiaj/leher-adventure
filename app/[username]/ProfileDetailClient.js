'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './profile.module.css';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="60" height="60" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const MountainIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3l4 8 5-5 5 15H2L8 3z"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
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

function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', { 
    month: 'long', 
    year: 'numeric'
  });
}

export default function ProfileDetailClient({ user, journeys }) {
  // Username is the Instagram handle
  const igUsername = user.username;

  return (
    <section className={styles.profile}>
      {/* Hero Section - Full Background */}
      <div className={styles.hero}>
        {/* Background Image */}
        {user.photo && (
          <div className={styles.heroBackground}>
            <Image 
              src={user.photo} 
              alt={user.name}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={true}
              priority
            />
          </div>
        )}
        
        {/* Overlay */}
        <div className={styles.heroOverlay}></div>
        
        {/* Content */}
        <div className={styles.heroContent}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {user.photo ? (
                <Image 
                  src={user.photo} 
                  alt={user.name}
                  fill
                  style={{ objectFit: 'cover' }}
                  unoptimized={true}
                  priority
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <UserIcon />
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h1 className={styles.name}>{user.name}</h1>

          {/* Instagram Link */}
          <a 
            href={`https://instagram.com/${igUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramBtn}
          >
            <InstagramIcon />
            <span>@{igUsername}</span>
          </a>
        </div>
      </div>

      {/* Completed Journeys */}
      <div className={styles.journeys}>
        <div className="container">
          <div className={styles.journeysHeader}>
            <h2 className={styles.journeysTitle}>
              <MountainIcon />
              Riwayat Pendakian
            </h2>
          </div>

          {journeys.length > 0 ? (
            <div className={styles.journeysGrid}>
              {journeys.map((journey, index) => (
                <div key={journey.id || index} className={styles.journeyCard}>
                  {/* Mountain Image */}
                  <div className={styles.journeyImage}>
                    {journey.mountainImage ? (
                      <Image 
                        src={journey.mountainImage}
                        alt={journey.mountainName}
                        fill
                        style={{ objectFit: 'cover' }}
                        unoptimized={true}
                      />
                    ) : (
                      <div className={styles.journeyImagePlaceholder}>
                        <MountainIcon />
                      </div>
                    )}
                    <div className={styles.yearBadge}>{journey.year}</div>
                  </div>

                  {/* Journey Info */}
                  <div className={styles.journeyInfo}>
                    <h3 className={styles.mountainName}>{journey.mountainName}</h3>
                    
                    {journey.mountainLocation && (
                      <p className={styles.mountainLocation}>
                        <LocationIcon />
                        {journey.mountainLocation}
                      </p>
                    )}

                    {journey.startDate && (
                      <p className={styles.journeyDate}>
                        <CalendarIcon />
                        {formatDate(journey.startDate)}
                      </p>
                    )}

                    {journey.description && (
                      <p className={styles.journeyDesc}>{journey.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <MountainIcon />
              <p>Belum ada riwayat pendakian</p>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div className={styles.backSection}>
        <Link href="/#tim-kami" className={styles.backBtn}>
          ← Kembali ke Tim
        </Link>
      </div>
    </section>
  );
}
