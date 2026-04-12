import { prisma } from '@/lib/prisma';

export default async function sitemap() {
  const baseUrl = 'https://leher-adventure.org';

  // Get all team members for profile pages
  const teamMembers = await prisma.user.findMany({
    where: { isTeam: true },
    select: { username: true, updatedAt: true },
  });

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/#tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#pendakian`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#tim-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/#galeri-kami`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Team member profile pages
  const profilePages = teamMembers.map((member) => ({
    url: `${baseUrl}/${member.username}`,
    lastModified: member.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticPages, ...profilePages];
}
