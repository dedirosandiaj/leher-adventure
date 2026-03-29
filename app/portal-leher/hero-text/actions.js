'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHeroText() {
  try {
    const heroText = await prisma.heroText.findFirst();
    if (!heroText) {
      // Buat default jika belum ada
      return await prisma.heroText.create({
        data: {
          title_line1: 'Selamat Datang di',
          title_line2: 'Leher Adventure',
          description: 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
        },
      });
    }
    return heroText;
  } catch (error) {
    // Jika tabel belum ada, return default value
    console.error('Error fetching hero text:', error);
    return {
      title_line1: 'Selamat Datang di',
      title_line2: 'Leher Adventure',
      description: 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
    };
  }
}

export async function updateHeroText(prevState, formData) {
  const title_line1 = formData.get('title_line1')?.trim();
  const title_line2 = formData.get('title_line2')?.trim();
  const description = formData.get('description')?.trim();

  if (!title_line1 || !title_line2 || !description) {
    return { error: 'Semua field wajib diisi.' };
  }

  try {
    const existing = await prisma.heroText.findFirst();
    
    if (existing) {
      await prisma.heroText.update({
        where: { id: existing.id },
        data: { title_line1, title_line2, description },
      });
    } else {
      await prisma.heroText.create({
        data: { title_line1, title_line2, description },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/hero-text');
    return { success: 'Text hero berhasil diupdate!' };
  } catch (error) {
    console.error('Error updating hero text:', error);
    return { error: 'Gagal update text: ' + error.message };
  }
}
