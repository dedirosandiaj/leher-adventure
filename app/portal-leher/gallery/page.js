import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import CrudGallery from './CrudGallery';

export default async function GalleryAdminPage() {
  // Order by descending (terbaru di atas)
  const items = await prisma.gallery.findMany({ orderBy: { order: 'desc' } });
  
  // Convert image/thumbnail URLs to presigned URLs for private S3 bucket
  const itemsWithPresignedUrls = await Promise.all(
    items.map(async (item) => {
      const updatedItem = { ...item };
      
      // Skip videos (image field contains YouTube video ID, not S3 URL)
      if (item.type === 'video') return updatedItem;
      
      // Handle image field
      if (item.image) {
        const key = getKeyFromUrl(item.image);
        if (key) {
          try {
            updatedItem.image = await getPresignedUrl(key, 86400);
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
