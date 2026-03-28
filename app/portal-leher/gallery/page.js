import { prisma } from '@/lib/prisma';
import CrudGallery from './CrudGallery';

export default async function GalleryAdminPage() {
  // Order by descending (terbaru di atas)
  const items = await prisma.gallery.findMany({ orderBy: { order: 'desc' } });
  return <CrudGallery items={items} />;
}
