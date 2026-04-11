import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { unstable_noStore } from 'next/cache';
import styles from './home.module.css';
import JourneyCard from './JourneyCard';
import { getEquipmentProgress, checkRegistration } from './actions';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MemberHome() {
  unstable_noStore();
  
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  let member = null;
  let teamMember = null;
  if (memberId) {
    member = await prisma.user.findUnique({
      where: { id: memberId }
    });
    
    // Get team member data for Instagram username
    teamMember = await prisma.user.findFirst({
      where: { ig: member?.username, isTeam: true }
    });
  }

  // Use teamMember's name or fallback to admin username
  const displayName = teamMember?.name || member?.username || 'user';
  
  // Get equipment progress
  const { progress: equipmentProgress } = await getEquipmentProgress();
  
  // Get upcoming journeys (status = PLANNED)
  const upcomingJourneys = await prisma.journey.findMany({
    where: { status: 'PLANNED' },
    include: { mountain: true },
    orderBy: { year: 'asc' }
  });

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <img src="/images/logo-leher.png" alt="Leher Adventure" className={styles.logo} />
        <h1 className={styles.welcome}>Selamat Datang!</h1>
        <p className={styles.username}>{displayName}</p>
      </header>
      
      {/* Upcoming Journeys */}
      {upcomingJourneys.length > 0 && (
        <div className={styles.journeysSection}>
          <h2 className={styles.sectionTitle}>Pendakian Mendatang</h2>
          <div className={styles.journeysList}>
            {upcomingJourneys.map(async (journey) => {
              const registration = await checkRegistration(journey.id);
              return (
                <JourneyCard 
                  key={journey.id} 
                  journey={journey}
                  equipmentProgress={equipmentProgress}
                  registrationStatus={registration?.status || null}
                />
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
}
