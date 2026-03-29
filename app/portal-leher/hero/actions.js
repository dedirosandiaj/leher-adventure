'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { deleteFromS3, getKeyFromUrl } from '@/lib/s3';

export async function deleteHeroSlide(id) {
  // Get slide data untuk hapus file dari S3
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  
  if (slide?.image) {
    // Hapus file dari S3
    const key = getKeyFromUrl(slide.image);
    if (key) {
      try {
        await deleteFromS3(key);
        console.log('Deleted from S3:', key);
      } catch (err) {
        console.error('Error deleting from S3:', err);
      }
    }
  }
  
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/hero');
  return { success: 'Slide berhasil dihapus!' };
}
