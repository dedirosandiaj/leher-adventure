import { prisma } from '@/lib/prisma';
import CrudJourney from './CrudJourney';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JourneyAdminPage() {
  unstable_noStore();
  const mountains = await prisma.mountain.findMany();
  return <CrudJourney mountains={mountains} />;
}
