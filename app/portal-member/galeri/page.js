export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import GalleryClient from './GalleryClient';
import UploadForm from './UploadForm';
import styles from './gallery.module.css';

export default async function MemberGallery() {
  const items = await prisma.gallery.findMany({ 
    orderBy: { order: 'desc' } 
  });
  
  // Convert image URLs to presigned URLs for images (skip videos)
  const itemsWithUrls = await Promise.all(
    items.map(async (item) => {
      if (item.type === 'video') return item;
      
      if (item.image) {
        const key = getKeyFromUrl(item.image);
        if (key) {
          try {
            return { ...item, image: await getPresignedUrl(key, 86400) };
          } catch (err) {
            console.error('Error generating presigned URL:', err);
          }
        }
      }
      return item;
    })
  );

  return (
    <div className={styles.gallery}>
      <h1 className={styles.title}>Gallery</h1>
      <UploadForm />
      <GalleryClient items={itemsWithUrls} />
    </div>
  );
}
