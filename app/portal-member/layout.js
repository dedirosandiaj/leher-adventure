import MobileNav from './components/MobileNav';
import styles from './member.module.css';

export default async function MemberLayout({ children }) {
  // Auth check sudah dihandle oleh middleware
  return (
    <div className={styles.memberContainer}>
      <main className={styles.mainContent}>
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
