import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Journey from '@/components/Journey';
import Team from '@/components/Team';
import Gallery from '@/components/Gallery';
import Footer from '@/components/Footer';

export default async function Home() {
  let galleryItems = [];
  let heroSlides = [];
  let heroText = null;
  let aboutData = null;

  try {
    [galleryItems, heroSlides, heroText, aboutData] = await Promise.all([
      prisma.gallery.findMany({ orderBy: { order: 'desc' } }), // terbaru di atas
      prisma.heroSlide.findMany({ orderBy: { order: 'desc' } }), // terbaru di atas
      prisma.heroText.findFirst(),
      prisma.about.findFirst(),
    ]);
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
