'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_CONTENT = 'Leher Adventure adalah komunitas pecinta alam yang lahir dari semangat persaudaraan dan kecintaan mendalam terhadap bentang alam Indonesia. Kami bukan sekadar kelompok pendaki, melainkan wadah bagi siapa saja yang ingin mengeksplorasi keagungan gunung dengan prinsip etika lingkungan yang kuat.\n\nMisi kami adalah menjalin silaturahmi antar pendaki, berbagi edukasi tentang keamanan mendaki (safety climbing), serta aktif dalam kegiatan konservasi alam. Kami percaya bahwa setiap langkah di puncak adalah sebuah pelajaran tentang kerendahan hati dan ketahanan diri.';

export async function getAbout() {
  try {
    const about = await prisma.about.findFirst();
    if (!about) {
      // Buat default jika belum ada
      return await prisma.about.create({
        data: { content: DEFAULT_CONTENT },
      });
    }
    return about;
  } catch (error) {
    console.error('Error fetching about:', error);
    return { content: DEFAULT_CONTENT };
  }
}

export async function updateAbout(prevState, formData) {
  const content = formData.get('content')?.trim();

  if (!content) {
    return { error: 'Content wajib diisi.' };
  }

  try {
    const existing = await prisma.about.findFirst();
    
    if (existing) {
      await prisma.about.update({
        where: { id: existing.id },
        data: { content },
      });
    } else {
      await prisma.about.create({
        data: { content },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/about');
    return { success: 'Tentang Kami berhasil diupdate!' };
  } catch (error) {
    console.error('Error updating about:', error);
    return { error: 'Gagal update Tentang Kami: ' + error.message };
  }
}
