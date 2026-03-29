import { prisma } from '@/lib/prisma';
import CrudJourney from './CrudJourney';

export default async function JourneyAdminPage() {
  const mountains = await prisma.mountain.findMany();
  return <CrudJourney mountains={mountains} />;
}
