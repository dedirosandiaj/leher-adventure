import { prisma } from '@/lib/prisma';
import CrudPerlengkapan from './CrudPerlengkapan';
import { unstable_noStore } from 'next/cache';

// Disable cache untuk selalu fetch data terbaru
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PerlengkapanPage() {
  unstable_noStore();
  
  // Fetch categories with item count
  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });
  
  // Fetch items with category info
  const items = await prisma.equipmentItem.findMany({
    orderBy: { createdAt: 'asc' },
    include: { category: true }
  });
  
  return <CrudPerlengkapan categories={categories} items={items} />;
}
