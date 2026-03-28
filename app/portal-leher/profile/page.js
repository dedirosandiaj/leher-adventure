import { getCurrentAdmin } from './actions';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const admin = await getCurrentAdmin();
  return <ProfileForm admin={admin} />;
}
