'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(true);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  // Toggle between logo and text every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowLogo((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} container`}>
        {/* Left spacer untuk balance di mobile */}
        <div className={styles.leftSpacer}></div>
        
        {/* Logo / Brand */}
        <div className={styles.logo}>
          <Link href="/" onClick={closeMenu} className={styles.logoLink}>
            <div className={`${styles.logoWrapper} ${showLogo ? styles.showLogo : styles.showText}`}>
              <Image
                src="/images/logo-leher.png"
                alt="Leher Adventure Logo"
                width={150}
                height={50}
                style={{ objectFit: 'contain' }}
                className={styles.logoImage}
              />
              <span className={styles.logoText}>Leher Adventure</span>
            </div>
          </Link>
        </div>
        
        {/* Burger Menu Button */}
        <button 
          className={`${styles.burger} ${isOpen ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Links */}
        <ul className={`${styles.navLinks} ${isOpen ? styles.open : ''}`}>
          <li><Link href="#tentang-kami" onClick={closeMenu}>Tentang Kami</Link></li>
          <li><Link href="#jejak-kami" onClick={closeMenu}>Jejak Kami</Link></li>
          <li><Link href="#tim-kami" onClick={closeMenu}>Tim Kami</Link></li>
          <li><Link href="#galeri-kami" onClick={closeMenu}>Galeri Kami</Link></li>
        </ul>
      </div>
    </nav>
  );
}
