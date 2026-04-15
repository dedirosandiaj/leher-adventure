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
  
  // Add hasPlanned flag to each year group
  Object.keys(journeysMap).forEach(year => {
    const yearJourneys = journeys.filter(j => j.year === parseInt(year));
    journeysMap[year].hasPlanned = yearJourneys.some(j => j.status === 'PLANNED');
    journeysMap[year].status = yearJourneys.some(j => j.status === 'PLANNED') ? 'PLANNED' : 
                               yearJourneys.some(j => j.status === 'ONGOING') ? 'ONGOING' : 'COMPLETED';
  });
  
  // Convert to array and sort: Rencana (PLANNED) first, then by year desc
  const formattedJourneys = Object.values(journeysMap).sort((a, b) => {
    // Prioritize years that have PLANNED journeys
    if (a.hasPlanned && !b.hasPlanned) return -1;
    if (!a.hasPlanned && b.hasPlanned) return 1;
    
    // If same priority, sort by year desc
    return b.year - a.year;
  });

  return <JourneyClient journeys={formattedJourneys} />;
}
