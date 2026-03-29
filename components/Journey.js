import { prisma } from '@/lib/prisma';
import JourneyClient from './JourneyClient';

export default async function Journey() {
  const mountains = await prisma.mountain.findMany();
  
  // Group mountains by year
  const journeysMap = mountains.reduce((acc, mountain) => {
    const year = mountain.year;
    if (!acc[year]) {
      acc[year] = {
        year,
        mountains: [],
      };
    }
    acc[year].mountains.push(mountain);
    return acc;
  }, {});
  
  // Convert to array and sort by year desc
  const journeys = Object.values(journeysMap).sort((a, b) => b.year - a.year);
  
  // Determine status based on mountains in that year
  journeys.forEach(journey => {
    const hasRencana = journey.mountains.some(m => m.status === 'Rencana');
    const hasBerlangsung = journey.mountains.some(m => m.status === 'Berlangsung');
    const allSelesai = journey.mountains.every(m => m.status === 'Selesai');
    
    if (hasBerlangsung) {
      journey.status = 'Berlangsung';
    } else if (allSelesai) {
      journey.status = 'Selesai';
    } else if (hasRencana) {
      journey.status = 'Rencana';
    } else {
      journey.status = 'Selesai';
    }
  });

  return <JourneyClient journeys={journeys} />;
}
