import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import GalleryClient from './GalleryClient';
import UploadForm from './UploadForm';
import styles from './gallery.module.css';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MemberGallery() {
  unstable_noStore();
  const items = await prisma.media.findMany({ 
    where: { section: 'GALLERY' },
    orderBy: { createdAt: 'desc' } 
  });
  
  // Convert image URLs to presigned URLs for images (skip videos)
  const itemsWithUrls = await Promise.all(
    items.map(async (item) => {
      if (item.type === 'VIDEO') return item;
      
      if (item.url) {
        const key = getKeyFromUrl(item.url);
        if (key) {
          try {
            return { ...item, url: await getPresignedUrl(key, 86400) };
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
