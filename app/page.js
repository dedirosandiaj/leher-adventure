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
      // Skip videos (url field contains YouTube video ID, not S3 URL)
      if (item.type === 'VIDEO') return item;
      
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
  let teamMembers = [];

  try {
    const [galleryData, heroSlidesData, heroTextData, aboutDataResult, teamData] = await Promise.all([
      prisma.media.findMany({ where: { section: 'GALLERY' }, orderBy: { createdAt: 'desc' } }),
      prisma.media.findMany({ where: { section: 'HERO' }, orderBy: { order: 'desc' } }),
      prisma.heroText.findFirst(),
      prisma.about.findFirst(),
      prisma.user.findMany({ where: { isTeam: true }, select: { name: true, username: true } }),
    ]);
    
    // Convert to presigned URLs for private S3 bucket
    galleryItems = await getPresignedImages(galleryData, 'url');
    const heroSlidesWithUrls = await getPresignedImages(heroSlidesData, 'url');
    heroSlides = heroSlidesWithUrls.map(s => s.url);
    heroText = heroTextData;
    aboutData = aboutDataResult;
    teamMembers = teamData;
  } catch (error) {
    console.error('Error fetching data:', error);
    // Jika tabel belum ada, gunakan default values
  }

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Leher Adventure',
    url: 'https://leher-adventure.org',
    logo: 'https://leher-adventure.org/images/logo-leher.png',
    description: 'Leher Adventure - Komunitas petualangan gunung di Indonesia. Jelajahi jejak ekspedisi kami dan bergabunglah dalam petualangan berikutnya.',
    sameAs: [
      'https://instagram.com/leheradventure',
    ],
    member: teamMembers.map(member => ({
      '@type': 'Person',
      name: member.name,
      url: `https://leher-adventure.org/${member.username}`,
      sameAs: [`https://instagram.com/${member.username}`],
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
