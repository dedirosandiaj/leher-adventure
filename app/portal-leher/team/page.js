import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import CrudTeam from './CrudTeam';

export default async function TeamAdminPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { order: 'asc' } });
  
  // Convert photo URLs to presigned URLs for private S3 bucket
  const membersWithPresignedPhotos = await Promise.all(
    members.map(async (member) => {
      if (member.photo) {
        const key = getKeyFromUrl(member.photo);
        if (key) {
          try {
            const presignedUrl = await getPresignedUrl(key, 86400); // 24 hours
            return { ...member, photo: presignedUrl };
          } catch (err) {
            console.error('Error generating presigned URL for team:', err);
          }
        }
      }
      return member;
    })
  );
  
  return <CrudTeam members={membersWithPresignedPhotos} />;
}
