'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../portal.module.css';

export default function SidebarNav({ logoutAction }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/portal-leher') {
      return pathname === '/portal-leher' || pathname === '/portal-leher/';
    }
    // Exact match atau sub-route (tapi bukan prefix dari route lain)
    if (pathname === href) return true;
    // Cek apakah ini sub-route (ada / setelah href)
    return pathname.startsWith(href + '/');
  };

  return (
    <>
      <nav className={styles.sidebarNav}>
        <Link 
          href="/portal-leher" 
          className={isActive('/portal-leher') ? styles.active : ''}
        >
          Dashboard
        </Link>
        <Link 
          href="/portal-leher/hero" 
          className={isActive('/portal-leher/hero') ? styles.active : ''}
        >
          Kelola Hero Slides
        </Link>
        <Link 
          href="/portal-leher/hero-text" 
          className={isActive('/portal-leher/hero-text') ? styles.active : ''}
        >
          Edit Text Hero
        </Link>
        <Link 
          href="/portal-leher/about" 
          className={isActive('/portal-leher/about') ? styles.active : ''}
        >
          Edit Tentang Kami
        </Link>
        <Link 
          href="/portal-leher/journey" 
          className={isActive('/portal-leher/journey') ? styles.active : ''}
        >
          Kelola Jejak
        </Link>
        <Link 
          href="/portal-leher/team" 
          className={isActive('/portal-leher/team') ? styles.active : ''}
        >
          Kelola Tim
        </Link>
        <Link 
          href="/portal-leher/gallery" 
          className={isActive('/portal-leher/gallery') ? styles.active : ''}
        >
          Kelola Galeri
        </Link>
        <Link 
          href="/portal-leher/kelola-user" 
          className={isActive('/portal-leher/kelola-user') ? styles.active : ''}
        >
          Kelola User
        </Link>
        <Link href="/">Kembali ke Web</Link>
      </nav>
      <form action={logoutAction} className={styles.logoutForm}>
        <button type="submit" className={styles.logoutBtn}>Logout</button>
      </form>
    </>
  );
}
