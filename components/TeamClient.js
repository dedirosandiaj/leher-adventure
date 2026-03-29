'use client';
import styles from './Team.module.css';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

function TeamCard({ member }) {
  const igUsername = member.ig?.replace('@', '') || '';
  
  return (
    <div className={styles.card}>
      <div className={styles.cardInner}>
        <div className={styles.avatar}>
          {member.photo ? (
            <img 
              src={member.photo} 
              alt={member.name}
              loading="lazy"
              onError={(e) => {
                console.error('Failed to load photo:', member.photo);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={styles.avatarPlaceholder} style={{display: member.photo ? 'none' : 'flex'}}>
            <UserIcon />
          </div>
        </div>
        
        <div className={styles.info}>
          <h3 className={styles.name}>{member.name}</h3>
          
          <a 
            href={`https://instagram.com/${igUsername}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.instagram}
          >
            <InstagramIcon />
            <span>@{igUsername}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function TeamClient({ team }) {
  return (
    <section id="tim-kami" className={styles.team}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Tim Kami</h2>
          <p className={styles.subtitle}>
            Tim Leher Adventure yang berdedikasi menjelajahi setiap sudut petualangan.
          </p>
        </div>
        
        <div className={styles.grid}>
          {team.map((member, index) => (
            <TeamCard key={member.id || index} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
