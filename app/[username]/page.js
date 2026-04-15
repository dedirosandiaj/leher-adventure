import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ProfileDetailClient from './ProfileDetailClient';

// Force dynamic rendering untuk generate presigned URL saat request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: { name: true, username: true }
  });

  if (!user) {
    return { title: 'User Not Found' };
  }

  return {
    title: `${user.name} - Tim Leher Adventure`,
    description: `Profil ${user.name} (@${user.username}) - Anggota tim Leher Adventure. Lihat riwayat pendakian dan perjalanan gunung yang telah diselesaikan.`,
    openGraph: {
      title: `${user.name} - Tim Leher Adventure`,
      description: `Profil ${user.name} (@${user.username}) - Anggota tim Leher Adventure.`,
      type: 'profile',
      url: `https://leher-adventure.org/${user.username}`,
      images: [
        {
          url: '/images/hero.png',
          width: 1200,
          height: 630,
          alt: `${user.name} - Leher Adventure`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${user.name} - Tim Leher Adventure`,
      description: `Profil ${user.name} (@${user.username}) - Anggota tim Leher Adventure.`,
    },
    alternates: {
      canonical: `https://leher-adventure.org/${user.username}`,
    },
  };
}

export async function generateStaticParams() {
  const users = await prisma.user.findMany({
    where: { isTeam: true },
    select: { username: true },
  });
  
  return users.map((user) => ({
    username: user.username,
  }));
}

export default async function ProfilePage({ params }) {
  const { username } = await params;

  // Get user data
  const user = await prisma.user.findUnique({
    where: { username, isTeam: true },
    select: {
      id: true,
      name: true,
      username: true,
      photo: true,
    }
  });

  if (!user) {
    notFound();
  }

  // Get all completed journeys (always show all, no registration required)
  const allCompletedJourneys = await prisma.journey.findMany({
    where: {
      status: 'COMPLETED'
    },
    include: {
      mountain: true
    },
    orderBy: {
      startDate: 'desc'
    }
  });

  const completedJourneys = allCompletedJourneys.map(j => ({
    id: j.id,
    mountainName: j.mountain.name,
    mountainLocation: j.mountain.location,
    year: j.year,
    startDate: j.startDate,
    endDate: j.endDate,
    description: j.description,
    mountainImage: j.mountain.image,
    latitude: j.mountain.latitude,
    longitude: j.mountain.longitude,
  }));

  // Generate presigned URLs for private S3 bucket
  let photoUrl = user.photo;
  if (photoUrl) {
    const key = getKeyFromUrl(photoUrl);
    if (key) {
      try {
        photoUrl = await getPresignedUrl(key, 86400); // 24 hours
      } catch (err) {
        console.error('Error generating presigned URL for photo:', err);
      }
    }
  }

  const userData = {
    ...user,
    photo: photoUrl,
  };

  // Generate presigned URLs for mountain images
  const journeysWithImages = await Promise.all(
    completedJourneys.map(async (journey) => {
      let updatedJourney = { ...journey };
      if (journey.mountainImage) {
        const key = getKeyFromUrl(journey.mountainImage);
        if (key) {
          try {
            const presignedUrl = await getPresignedUrl(key, 86400);
            updatedJourney.mountainImage = presignedUrl;
          } catch (err) {
            console.error('Error generating presigned URL for mountain:', err);
          }
        }
      }
      return updatedJourney;
    })
  );

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: user.name,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'username',
      value: user.username,
    },
    url: `https://leher-adventure.org/${user.username}`,
    image: photoUrl || undefined,
    sameAs: [
      `https://instagram.com/${user.username}`,
    ],
    knowsAbout: ['Pendakian Gunung', 'Petualangan Indonesia', 'Hiking', 'Mountaineering'],
    memberOf: {
      '@type': 'Organization',
      name: 'Leher Adventure',
      url: 'https://leher-adventure.org',
    },
  };

  return (
    <main style={{ margin: 0, padding: 0 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileDetailClient user={userData} journeys={journeysWithImages} />
      <Footer />
    </main>
  );
}
