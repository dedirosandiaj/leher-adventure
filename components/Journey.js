import { prisma } from '@/lib/prisma';
import JourneyClient from './JourneyClient';

export default async function Journey() {
  const journeys = await prisma.journey.findMany({
    orderBy: { year: 'desc' },
    include: { mountains: true },
  });

  return <JourneyClient journeys={journeys} />;
}
