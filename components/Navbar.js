import Link from 'next/link';
import Image from 'next/image';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={`${styles.container} container`}>
        <div className={styles.logo}>
          <Link href="/">
            <Image
              src="/images/logo-leher.png"
              alt="Leher Adventure Logo"
              width={150}
              height={50}
              style={{ objectFit: 'contain' }}
            />
          </Link>
        </div>
        <ul className={styles.navLinks}>
          <li><Link href="#tentang-kami">Tentang Kami</Link></li>
          <li><Link href="#jejak-kami">Jejak Kami</Link></li>
          <li><Link href="#tim-kami">Tim Kami</Link></li>
          <li><Link href="#galeri-kami">Galeri Kami</Link></li>
        </ul>
      </div>
    </nav>
  );
}
