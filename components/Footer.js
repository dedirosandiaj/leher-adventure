import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.info}>
            <div className={styles.logoWrapper}>
              <Image 
                src="/images/logo-leher.png" 
                alt="Leher Adventure Logo" 
                width={120} 
                height={40} 
                style={{ objectFit: 'contain' }}
              />
            </div>
            <p>Bersama menjaga alam, bersama menaklukkan puncak. Komunitas pendaki Indonesia yang berdedikasi.</p>
          </div>
          <div className={styles.links}>
            <h4 className={styles.heading}>Navigasi</h4>
            <ul className={styles.linkList}>
              <li><a href="#tentang-kami" className={styles.link}>Tentang Kami</a></li>
              <li><a href="#jejak-kami" className={styles.link}>Jejak Kami</a></li>
              <li><a href="#tim-kami" className={styles.link}>Tim Kami</a></li>
              <li><a href="#galeri-kami" className={styles.link}>Galeri Kami</a></li>
            </ul>
          </div>
          <div className={styles.social}>
            <h4 className={styles.heading}>Ikuti Kami</h4>
            <div className={styles.socialLinks}>
              <a href="https://www.instagram.com/leher.adventure" className={styles.link}>Instagram</a>
              <a href="https://www.youtube.com/@LeherAdventureOfficial" className={styles.link}>YouTube</a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Leher Adventure. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
