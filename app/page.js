import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Journey from '@/components/Journey';
import Team from '@/components/Team';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';

// Helper to convert S3 URLs to presigned URLs (skip videos)
async function getPresignedImages(items, imageField = 'image') {
  return Promise.all(
    items.map(async (item) => {
      // Skip videos (image field contains YouTube video ID, not S3 URL)
      if (item.type === 'video') return item;
      
      const imageUrl = item[imageField];
      if (!imageUrl) return item;
      
      const key = getKeyFromUrl(imageUrl);
      if (key) {
        try {
          const presignedUrl = await getPresignedUrl(key, 86400); // 24 hours
          return { ...item, [imageField]: presignedUrl };
        } catch (err) {
          console.error('Error generating presigned URL:', err);
        }
      }
      return item;
    })
  );
}

export default async function Home() {
  let galleryItems = [];
  let heroSlides = [];
  let heroText = null;
  let aboutData = null;

  try {
    const [galleryData, heroSlidesData, heroTextData, aboutDataResult] = await Promise.all([
      prisma.gallery.findMany({ orderBy: { id: 'desc' } }),
      prisma.heroSlide.findMany({ orderBy: { order: 'desc' } }),
      prisma.heroText.findFirst(),
      prisma.about.findFirst(),
    ]);
    
    // Convert to presigned URLs for private S3 bucket
    galleryItems = await getPresignedImages(galleryData, 'image');
    const heroSlidesWithUrls = await getPresignedImages(heroSlidesData, 'image');
    heroSlides = heroSlidesWithUrls.map(s => s.image);
    heroText = heroTextData;
    aboutData = aboutDataResult;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Jika tabel belum ada, gunakan default values
  }

  return (
    <main>
      <Navbar />
      <Hero slides={heroSlides} heroText={heroText} />
      <About aboutData={aboutData} />
      <Journey />
      <Team />
      <Gallery items={galleryItems} />
      <Footer />
    </main>
  );
}
