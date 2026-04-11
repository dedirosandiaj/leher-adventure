import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import CrudGallery from './CrudGallery';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function GalleryAdminPage() {
  unstable_noStore();
  // Order by descending (terbaru di atas)
  const items = await prisma.media.findMany({ 
    where: { section: 'GALLERY' },
    orderBy: { createdAt: 'desc' } 
  });
  
  // Convert image/thumbnail URLs to presigned URLs for private S3 bucket
  const itemsWithPresignedUrls = await Promise.all(
    items.map(async (item) => {
      const updatedItem = { ...item };
      
      // Skip videos (url field contains YouTube video ID, not S3 URL)
      if (item.type === 'VIDEO') return updatedItem;
      
      // Handle url field
      if (item.url) {
        const key = getKeyFromUrl(item.url);
        if (key) {
          try {
            updatedItem.url = await getPresignedUrl(key, 86400);
          } catch (err) {
            console.error('Error generating presigned URL for gallery image:', err);
          }
        }
      }
      
      // Handle thumbnail field for videos
      if (item.thumbnail) {
        const key = getKeyFromUrl(item.thumbnail);
        if (key) {
          try {
            updatedItem.thumbnail = await getPresignedUrl(key, 86400);
          } catch (err) {
            console.error('Error generating presigned URL for gallery thumbnail:', err);
          }
        }
      }
      
      return updatedItem;
    })
  );
  
  return <CrudGallery items={itemsWithPresignedUrls} />;
}
