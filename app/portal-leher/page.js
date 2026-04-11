import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './portal.module.css';

// Icons untuk stats
const statIcons = {
  hero: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  mountain: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
    </svg>
  ),
  team: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  ),
  gallery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
};

export default async function PortalDashboard() {
  const [mountains, teamMembers, galleries, heroSlides] = await Promise.all([
    prisma.mountain.findMany(),
    prisma.user.findMany({ where: { isTeam: true } }),
    prisma.media.findMany({ where: { section: 'GALLERY' } }),
    prisma.media.findMany({ where: { section: 'HERO' } }),
  ]);

  const stats = [
    { 
      label: 'Hero Slides', 
      count: heroSlides.length, 
      href: '/portal-leher/hero', 
      color: '#e74c3c',
      icon: 'hero',
      description: 'Gambar banner utama'
    },
    { 
      label: 'Jejak Ekspedisi', 
      count: mountains.length, 
      href: '/portal-leher/journey', 
      color: '#3498db',
      icon: 'mountain',
      description: 'Gunung yang didaki'
    },
    { 
      label: 'Anggota Tim', 
      count: teamMembers.length, 
      href: '/portal-leher/team', 
      color: '#27ae60',
      icon: 'team',
      description: 'Tim Leher Adventure'
    },
    { 
      label: 'Item Galeri', 
      count: galleries.length, 
      href: '/portal-leher/gallery', 
      color: '#f39c12',
      icon: 'gallery',
      description: 'Foto dan video'
    },
  ];

  const quickActions = [
    { label: 'Tambah Hero', href: '/portal-leher/hero', color: '#e74c3c' },
    { label: 'Tambah Jejak', href: '/portal-leher/journey', color: '#3498db' },
    { label: 'Tambah Tim', href: '/portal-leher/team', color: '#27ae60' },
    { label: 'Tambah Galeri', href: '/portal-leher/gallery', color: '#f39c12' },
  ];

  return (
    <div>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Selamat Datang di Portal Admin</h1>
        <p className={styles.pageSubtitle}>
          Kelola konten website Leher Adventure dengan mudah dan efisien.
        </p>
      </header>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <Link 
            key={stat.label} 
            href={stat.href} 
            className={styles.statCard}
            style={{ '--card-color': stat.color }}
          >
            <div className={styles.statIcon} style={{ color: stat.color }}>
              {statIcons[stat.icon]}
            </div>
            <div className={styles.statCount} style={{ color: stat.color }}>
              {stat.count}
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '4px' }}>
              {stat.description}
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Aksi Cepat</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Tambah konten baru dengan cepat:
        </p>
        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className={styles.quickActionBtn}
              style={{ 
                borderColor: action.color,
                color: action.color 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className={styles.sectionCard}>
        <h2 className={styles.sectionTitle}>Tips Penggunaan</h2>
        <ul style={{ color: '#666', lineHeight: '1.8', paddingLeft: '1.2rem' }}>
          <li>Gunakan menu <strong>Hero</strong> untuk mengatur gambar banner di halaman utama</li>
          <li>Update <strong>Text Hero</strong> untuk mengubah teks sambutan di halaman depan</li>
          <li>Kelola <strong>Jejak Ekspedisi</strong> untuk mencatat gunung yang sudah didaki</li>
          <li>Tambahkan <strong>Anggota Tim</strong> untuk menampilkan tim di website</li>
          <li>Unggah foto dan video ke <strong>Galeri</strong> untuk dokumentasi perjalanan</li>
        </ul>
      </div>
    </div>
  );
}
