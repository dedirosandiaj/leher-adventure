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
          title: 'Jelajahi Alam,',
          subtitle: 'Temukan Jati Diri.',
          description: 'Komunitas pecinta alam yang berdedikasi untuk menjaga kelestarian hutan dan pegunungan Indonesia.',
        },
      });
    }
    return heroText;
  } catch (error) {
    // Jika tabel belum ada, return default value
    console.error('Error fetching hero text:', error);
    return {
      title: 'Jelajahi Alam,',
      subtitle: 'Temukan Jati Diri.',
      description: 'Komunitas pecinta alam yang berdedikasi untuk menjaga kelestarian hutan dan pegunungan Indonesia.',
    };
  }
}

export async function updateHeroText(prevState, formData) {
  const title = formData.get('title')?.trim();
  const subtitle = formData.get('subtitle')?.trim();
  const description = formData.get('description')?.trim();

  try {
    const existing = await prisma.heroText.findFirst();
    
    if (existing) {
      await prisma.heroText.update({
        where: { id: existing.id },
        data: { title, subtitle, description },
      });
    } else {
      await prisma.heroText.create({
        data: { title, subtitle, description },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/hero-text');
    return { success: 'Text hero berhasil diupdate!' };
  } catch (error) {
    console.error('Error updating hero text:', error);
    return { error: 'Gagal update text. Tabel HeroText mungkin belum tersedia.' };
  }
}
