'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
      // Update
      await prisma.mountain.update({
        where: { id: parseInt(id) },
        data: { name, year, status },
      });
    } else {
      // Create
      await prisma.mountain.create({
        data: { name, year, status },
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
    const mountainId = parseInt(id);
    console.log('Moving mountain', mountainId, 'to status', newStatus);
    await prisma.mountain.update({
      where: { id: mountainId },
      data: { status: newStatus },
    });
    revalidatePath('/');
    revalidatePath('/portal-leher/journey');
    return { success: 'Status diperbarui!' };
  } catch (error) {
    console.error('Error moving mountain:', error);
    return { error: 'Gagal mengubah status.' };
  }
}
