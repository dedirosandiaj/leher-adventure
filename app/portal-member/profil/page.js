import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import ProfileForm from './ProfileForm';
import { updateProfile } from './actions';
import { logoutMember } from '@/app/login-member/actions';
import styles from './profile.module.css';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MemberProfile() {
  unstable_noStore();
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  const member = await prisma.user.findUnique({
    where: { id: memberId }
  });
  
  console.log('Profil page - member:', member);
  
  // Check if member is also a team member
  // If member is a team member, they can edit their own team profile
  const isTeamMember = member?.isTeam;
  
  console.log('Profil page - isTeamMember:', isTeamMember);
  
  // Convert photo to presigned URL if exists
  let photoUrl = member?.photo;
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
        isTeamMember={isTeamMember}
        photoUrl={photoUrl}
        updateAction={updateProfile}
      />
      
      <form action={logoutMember} className={styles.logoutForm}>
        <button type="submit" className={styles.logoutBtn}>Logout</button>
      </form>
    </div>
  );
}
