import { prisma } from '@/lib/prisma';
import { getPresignedUrl, getKeyFromUrl } from '@/lib/s3';
import { notFound } from 'next/navigation';
import Footer from '@/components/Footer';
import ProfileDetailClient from './ProfileDetailClient';

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

  // Get completed journeys where user was registered and approved
  const registrations = await prisma.journeyRegistration.findMany({
    where: {
      userId: user.id,
      status: 'APPROVED',
      journey: {
        status: 'COMPLETED'
      }
    },
    include: {
      journey: {
        include: {
          mountain: true
        }
      }
    },
    orderBy: {
      journey: {
        startDate: 'desc'
      }
    }
  });

  let completedJourneys;

  if (registrations.length > 0) {
    // User has personal journey history
    completedJourneys = registrations.map(r => ({
      id: r.journey.id,
      mountainName: r.journey.mountain.name,
      mountainLocation: r.journey.mountain.location,
      year: r.journey.year,
      startDate: r.journey.startDate,
      endDate: r.journey.endDate,
      description: r.journey.description,
      mountainImage: r.journey.mountain.image,
    }));
  } else {
    // Show all completed journeys if user has no personal history
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

    completedJourneys = allCompletedJourneys.map(j => ({
      id: j.id,
      mountainName: j.mountain.name,
      mountainLocation: j.mountain.location,
      year: j.year,
      startDate: j.startDate,
      endDate: j.endDate,
      description: j.description,
      mountainImage: j.mountain.image,
    }));
  }

  // Convert photo to presigned URL
  let photoUrl = user.photo;
  if (photoUrl) {
    const key = getKeyFromUrl(photoUrl);
    if (key) {
      try {
        photoUrl = await getPresignedUrl(key, 86400);
      } catch (err) {
        console.error('Error generating presigned URL:', err);
      }
    }
  }

  // Convert mountain images to presigned URLs
  const journeysWithPresignedImages = await Promise.all(
    completedJourneys.map(async (journey) => {
      if (journey.mountainImage) {
        const key = getKeyFromUrl(journey.mountainImage);
        if (key) {
          try {
            const presignedUrl = await getPresignedUrl(key, 86400);
            return { ...journey, mountainImage: presignedUrl };
          } catch (err) {
            console.error('Error generating presigned URL for mountain:', err);
          }
        }
      }
      return journey;
    })
  );

  const userData = {
    ...user,
    photo: photoUrl,
  };

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
      <ProfileDetailClient user={userData} journeys={journeysWithPresignedImages} />
      <Footer />
    </main>
  );
}
