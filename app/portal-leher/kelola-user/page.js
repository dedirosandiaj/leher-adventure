import { getAllUsers, getCurrentAdmin } from './actions';
import UserManager from './UserManager';

export default async function ProfilePage() {
  const [users, currentAdmin] = await Promise.all([
    getAllUsers(),
    getCurrentAdmin()
  ]);
  
  return <UserManager users={users} currentAdmin={currentAdmin} />;
}
