import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import ProfileForm from './ProfileForm';
import { updateProfile } from './actions';
import { logoutMember } from '@/app/login-member/actions';
import styles from './profile.module.css';

export default async function MemberProfile() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  const member = await prisma.admin.findUnique({
    where: { id: parseInt(memberId) }
  });
  
  // Get team member data
  const teamMember = await prisma.teamMember.findFirst({
    where: { ig: member?.username }
  });
  
  // Convert photo to presigned URL if exists
  let photoUrl = teamMember?.photo;
  if (photoUrl) {
    const key = getKeyFromUrl(photoUrl);
    if (key) {
      try {
        photoUrl = await getPresignedUrl(key, 86400);
      } catch (err) {
        console.error('Error generating presigned URL:', err);
      }
    }
  }

  return (
    <div className={styles.profile}>
      <h1 className={styles.title}>Profil Saya</h1>
      
      <ProfileForm 
        member={member}
        teamMember={teamMember}
        photoUrl={photoUrl}
        updateAction={updateProfile}
      />
      
      <form action={logoutMember} className={styles.logoutForm}>
        <button type="submit" className={styles.logoutBtn}>Logout</button>
      </form>
    </div>
  );
}
