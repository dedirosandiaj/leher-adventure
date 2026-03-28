import { prisma } from '@/lib/prisma';
import CrudHero from './CrudHero';

export default async function HeroAdminPage() {
  // Terbaru di atas (descending by order/timestamp)
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'desc' } });
  return <CrudHero slides={slides} />;
}
