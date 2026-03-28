import { prisma } from '@/lib/prisma';
import styles from './Team.module.css';

export default async function Team() {
  const team = await prisma.teamMember.findMany();

  return (
    <section id="tim-kami" className={styles.team}>
      <div className="container">
        <h2 className={styles.title}>Tim Kami</h2>
        <p className={styles.subtitle}>Tim Leher Adventure.</p>

        <div className={styles.grid}>
          {team.map((member, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.avatar}>
                {member.photo ? (
                  <img 
                    src={member.photo} 
                    alt={member.name}
                  />
                ) : (
                  member.name.charAt(0)
                )}
              </div>
              <h3>{member.name}</h3>
              <a href={`https://instagram.com/${member.ig.replace('@', '')}`} target="_blank" className={styles.instagram}>
                {member.ig}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
