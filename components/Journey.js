import { prisma } from '@/lib/prisma';
import JourneyClient from './JourneyClient';

export default async function Journey() {
  // Fetch journeys with their mountains
  const journeys = await prisma.journey.findMany({
    include: { mountain: true },
    orderBy: { year: 'desc' }
  });
  
  // Group by year for display
  const journeysMap = journeys.reduce((acc, journey) => {
    const year = journey.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        status: journey.status,
        mountains: [],
      };
    }
    acc[year].mountains.push({
      ...journey.mountain,
      journeyStatus: journey.status,
      startDate: journey.startDate,
      endDate: journey.endDate,
    });
    return acc;
  }, {});
  
  // Convert to array and sort by year desc
  const formattedJourneys = Object.values(journeysMap).sort((a, b) => b.year - a.year);

  return <JourneyClient journeys={formattedJourneys} />;
}
