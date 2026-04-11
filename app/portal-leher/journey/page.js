import { prisma } from '@/lib/prisma';
import CrudJourney from './CrudJourney';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function JourneyAdminPage() {
  unstable_noStore();
  // Fetch journeys with mountain data
  const journeys = await prisma.journey.findMany({
    include: { mountain: true },
    orderBy: { year: 'desc' }
  });
  return <CrudJourney journeys={journeys} />;
}
