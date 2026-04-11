import { getRegistrations, getJourneys, getRegistrationStats } from './actions';
import RegistrasiClient from './RegistrasiClient';

export const dynamic = 'force-dynamic';

export default async function RegistrasiPage() {
  const [registrations, journeys, stats] = await Promise.all([
    getRegistrations(),
    getJourneys(),
    getRegistrationStats()
  ]);

  return (
    <RegistrasiClient 
      registrations={registrations}
      journeys={journeys}
      stats={stats}
    />
  );
}
