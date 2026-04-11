import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import SidebarNav from './components/SidebarNav';
import { ToastProvider } from './components/Toast';
import styles from './portal.module.css';
import './animations.css';

export default function PortalLayout({ children }) {
  const logout = async () => {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    redirect('/login-leher');
  };

  return (
    <ToastProvider>
      <div className={styles.adminContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarLogo}>Admin Portal</div>
          <SidebarNav logoutAction={logout} />
        </aside>
        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
