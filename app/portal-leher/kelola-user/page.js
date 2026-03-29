import { getAllUsers, getCurrentAdmin } from './actions';
import UserManager from './UserManager';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage() {
  unstable_noStore();
  const [users, currentAdmin] = await Promise.all([
    getAllUsers(),
    getCurrentAdmin()
  ]);
  
  return <UserManager users={users} currentAdmin={currentAdmin} />;
}
