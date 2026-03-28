import { prisma } from '@/lib/prisma';
import CrudJourney from './CrudJourney';

export default async function JourneyAdminPage() {
  const journeys = await prisma.journey.findMany({
    orderBy: { year: 'desc' }, // tahun terbaru di atas
    include: { mountains: true },
  });
  return <CrudJourney journeys={journeys} />;
}
