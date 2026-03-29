import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import styles from './home.module.css';

export default async function MemberHome() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  let member = null;
  let teamMember = null;
  if (memberId) {
    member = await prisma.admin.findUnique({
      where: { id: parseInt(memberId) }
    });
    
    // Get team member data for Instagram username
    teamMember = await prisma.teamMember.findFirst({
      where: { ig: member?.username }
    });
  }

  // Use teamMember's name or fallback to admin username
  const displayName = teamMember?.name || member?.username || 'user';
  
  // Get upcoming mountains (status = Rencana)
  const upcomingMountains = await prisma.mountain.findMany({
    where: { status: 'Rencana' },
    orderBy: { year: 'asc' }
  });

  return (
    <div className={styles.home}>
      <header className={styles.header}>
        <img src="/images/logo-leher.png" alt="Leher Adventure" className={styles.logo} />
        <h1 className={styles.welcome}>Selamat Datang!</h1>
        <p className={styles.username}>{displayName}</p>
      </header>
      
      {/* Upcoming Mountains */}
      {upcomingMountains.length > 0 && (
        <div className={styles.journeysSection}>
          <h2 className={styles.sectionTitle}>Pendakian Mendatang</h2>
          <div className={styles.journeysList}>
            {upcomingMountains.map(mountain => (
              <div key={mountain.id} className={styles.journeyCard}>
                <span className={styles.journeyYear}>{mountain.year}</span>
                <span className={styles.mountainName}>{mountain.name}</span>
                <span className={styles.journeyStatus}>{mountain.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
