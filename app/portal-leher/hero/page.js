import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import CrudHero from './CrudHero';

export default async function HeroAdminPage() {
  // Terbaru di atas (descending by order/timestamp)
  const slides = await prisma.heroSlide.findMany({ orderBy: { order: 'desc' } });
  
  // Convert image URLs to presigned URLs for private bucket access
  const slidesWithPresignedUrls = await Promise.all(
    slides.map(async (slide) => {
      const key = getKeyFromUrl(slide.image);
      if (key) {
        try {
          const presignedUrl = await getPresignedUrl(key, 86400); // 24 hours
          return { ...slide, image: presignedUrl };
        } catch (err) {
          console.error('Error generating presigned URL:', err);
          return slide;
        }
      }
      return slide;
    })
  );
  
  return <CrudHero slides={slidesWithPresignedUrls} />;
}
