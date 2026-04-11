'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to map status string to JourneyStatus enum
function mapStatus(status) {
  const statusMap = {
    'Rencana': 'PLANNED',
    'Berlangsung': 'ONGOING',
    'Dalam Perjalanan': 'ONGOING',
    'Selesai': 'COMPLETED',
    'Dibatalkan': 'CANCELLED'
  };
  return statusMap[status] || 'PLANNED';
}

export async function addMountain(prevState, formData) {
  const name = formData.get('name')?.trim();
  const year = parseInt(formData.get('year'));
  const status = formData.get('status') || 'Rencana';
  const id = formData.get('id');

  if (!name || !year) {
    return { error: 'Nama gunung dan tahun wajib diisi.' };
  }

  try {
    if (id) {
      // Update - update both Mountain name and Journey year/status
      await prisma.mountain.update({
        where: { id },
        data: { name },
      });
      
      // Update related journey
      const journey = await prisma.journey.findFirst({
        where: { mountainId: id }
      });
      
      if (journey) {
        await prisma.journey.update({
          where: { id: journey.id },
          data: { year, status: mapStatus(status) },
        });
      }
    } else {
      // Create - create Mountain and Journey
      const mountain = await prisma.mountain.create({
        data: { name },
      });
      
      await prisma.journey.create({
        data: {
          mountainId: mountain.id,
          year,
          status: mapStatus(status),
        },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/journey');
    return { success: id ? 'Gunung berhasil diupdate!' : 'Gunung berhasil ditambahkan!' };
  } catch (error) {
    console.error('Error saving mountain:', error);
    return { error: 'Gagal menyimpan: ' + error.message };
  }
}

export async function deleteMountain(id) {
  try {
    // Delete related journeys first (cascade will handle this, but being explicit)
    await prisma.journey.deleteMany({ where: { mountainId: id } });
    await prisma.mountain.delete({ where: { id } });
    revalidatePath('/');
    revalidatePath('/portal-leher/journey');
    return { success: 'Gunung dihapus!' };
  } catch (error) {
    console.error('Error deleting mountain:', error);
    return { error: 'Gagal menghapus.' };
  }
}

export async function moveMountain(id, newStatus) {
  try {
    console.log('Moving mountain', id, 'to status', newStatus);
    
    // Update journey status
    const journey = await prisma.journey.findFirst({
      where: { mountainId: id }
    });
    
    if (journey) {
      await prisma.journey.update({
        where: { id: journey.id },
        data: { status: mapStatus(newStatus) },
      });
    }
    
    revalidatePath('/');
    revalidatePath('/portal-leher/journey');
    return { success: 'Status diperbarui!' };
  } catch (error) {
    console.error('Error moving mountain:', error);
    return { error: 'Gagal mengubah status.' };
  }
}
