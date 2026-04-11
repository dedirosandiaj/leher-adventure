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
          titleLine1: 'Selamat Datang di',
          titleLine2: 'Leher Adventure',
          description: 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
        },
      });
    }
    return heroText;
  } catch (error) {
    // Jika tabel belum ada, return default value
    console.error('Error fetching hero text:', error);
    return {
      titleLine1: 'Selamat Datang di',
      titleLine2: 'Leher Adventure',
      description: 'Jelajahi keindahan alam Indonesia bersama kami. Setiap perjalanan adalah cerita yang tak terlupakan.',
    };
  }
}

export async function updateHeroText(prevState, formData) {
  const titleLine1 = formData.get('title_line1')?.trim();
  const titleLine2 = formData.get('title_line2')?.trim();
  const description = formData.get('description')?.trim();

  if (!titleLine1 || !titleLine2 || !description) {
    return { error: 'Semua field wajib diisi.' };
  }

  try {
    const existing = await prisma.heroText.findFirst();
    
    if (existing) {
      await prisma.heroText.update({
        where: { id: existing.id },
        data: { titleLine1, titleLine2, description },
      });
    } else {
      await prisma.heroText.create({
        data: { titleLine1, titleLine2, description },
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
