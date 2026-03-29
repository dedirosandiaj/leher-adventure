'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './MobileNav.module.css';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
);

const ProfileIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/portal-member') {
      return pathname === '/portal-member' || pathname === '/portal-member/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className={styles.mobileNav}>
      <Link 
        href="/portal-member" 
        className={`${styles.navItem} ${isActive('/portal-member') ? styles.active : ''}`}
      >
        <HomeIcon />
        <span>Home</span>
      </Link>
      <Link 
        href="/portal-member/galeri" 
        className={`${styles.navItem} ${isActive('/portal-member/galeri') ? styles.active : ''}`}
      >
        <GalleryIcon />
        <span>Gallery</span>
      </Link>
      <Link 
        href="/portal-member/profil" 
        className={`${styles.navItem} ${isActive('/portal-member/profil') ? styles.active : ''}`}
      >
        <ProfileIcon />
        <span>Profile</span>
      </Link>
    </nav>
  );
}
