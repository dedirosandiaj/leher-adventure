import { getExpenses, getJourneys, getExpenseStats } from './actions';
import KeuanganClient from './KeuanganClient';

export const dynamic = 'force-dynamic';

export default async function KeuanganPage() {
  const [expenses, journeys, stats] = await Promise.all([
    getExpenses(),
    getJourneys(),
    getExpenseStats()
  ]);

  return (
    <KeuanganClient 
      expenses={expenses}
      journeys={journeys}
      stats={stats}
    />
  );
}
