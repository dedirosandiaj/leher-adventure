import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import TeamClient from './TeamClient';

export default async function Team() {
  const team = await prisma.user.findMany({
    where: { isTeam: true },
    orderBy: { createdAt: 'asc' }
  });
  
  // Convert photo URLs to presigned URLs for private S3 bucket
  const teamWithPresignedPhotos = await Promise.all(
    team.map(async (member) => {
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

  return <TeamClient team={teamWithPresignedPhotos} />;
}
