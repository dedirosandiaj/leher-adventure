import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import styles from './portal.module.css';

export default async function PortalDashboard() {
  const [mountains, teamMembers, galleries, heroSlides] = await Promise.all([
    prisma.mountain.findMany(),
    prisma.teamMember.findMany(),
    prisma.gallery.findMany(),
    prisma.heroSlide.findMany(),
  ]);

  const mountainCount = mountains.length;
  const teamCount = teamMembers.length;
  const galleryCount = galleries.length;
  const heroCount = heroSlides.length;

  const stats = [
    { label: 'Hero Slides', count: heroCount, href: '/portal-leher/hero', color: '#e74c3c' },
    { label: 'Gunung', count: mountainCount, href: '/portal-leher/journey', color: '#3498db' },
    { label: 'Anggota Tim', count: teamCount, href: '/portal-leher/team', color: '#27ae60' },
    { label: 'Item Galeri', count: galleryCount, href: '/portal-leher/gallery', color: '#f39c12' },
  ];

  return (
    <div>
      <h1 className={styles.pageTitle}>Selamat Datang di Portal Admin</h1>
      <p className={styles.pageText}>Pilih menu di bilah pamping (sidebar) kiri untuk mulai mengelola konten website Leher Adventure secara dinamis melalui Database.</p>

      <div className={styles.statsGrid}>
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className={styles.statCard} style={{ borderLeftColor: stat.color }}>
            <div className={styles.statCount} style={{ color: stat.color }}>{stat.count}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
