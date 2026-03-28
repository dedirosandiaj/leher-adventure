'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAbout() {
  try {
    const about = await prisma.about.findFirst();
    if (!about) {
      // Buat default jika belum ada
      return await prisma.about.create({
        data: {
          title: 'Tentang Kami',
          paragraph1: 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia. Kami bukan sekadar kelompok pendaki, melainkan wadah bagi siapa saja yang ingin mengeksplorasi keagungan gunung dengan prinsip etika lingkungan yang kuat.',
          paragraph2: 'Misi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki (safety climbing), serta aktif dalam kegiatan konservasi alam. Kami percaya bahwa setiap langkah di puncak adalah sebuah pelajaran tentang kerendahan hati dan ketahanan diri.',
        },
      });
    }
    return about;
  } catch (error) {
    console.error('Error fetching about:', error);
    return {
      title: 'Tentang Kami',
      paragraph1: 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia.',
      paragraph2: 'Misi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki.',
    };
  }
}

export async function updateAbout(prevState, formData) {
  const title = formData.get('title')?.trim();
  const paragraph1 = formData.get('paragraph1')?.trim();
  const paragraph2 = formData.get('paragraph2')?.trim();

  try {
    const existing = await prisma.about.findFirst();
    
    if (existing) {
      await prisma.about.update({
        where: { id: existing.id },
        data: { title, paragraph1, paragraph2 },
      });
    } else {
      await prisma.about.create({
        data: { title, paragraph1, paragraph2 },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/about');
    return { success: 'Tentang Kami berhasil diupdate!' };
  } catch (error) {
    console.error('Error updating about:', error);
    return { error: 'Gagal update Tentang Kami.' };
  }
}
