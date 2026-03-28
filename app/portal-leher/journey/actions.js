'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function addJourneyYear(prevState, formData) {
  const year = formData.get('year')?.trim();
  const status = formData.get('status') || 'Selesai';
  if (!year) return { error: 'Tahun wajib diisi.' };

  // Order berdasarkan tahun (numerik) agar sorting berfungsi
  const order = parseInt(year, 10) || 0;

  await prisma.journey.create({ data: { year, status, order } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
  return { success: 'Tahun ekspedisi berhasil ditambahkan!' };
}

export async function updateJourney(prevState, formData) {
  const id = formData.get('id');
  const year = formData.get('year')?.trim();
  const status = formData.get('status');
  if (!id || !year) return { error: 'ID dan tahun wajib diisi.' };

  // Update order berdasarkan tahun
  const order = parseInt(year, 10) || 0;

  await prisma.journey.update({ where: { id }, data: { year, status, order } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
  return { success: 'Tahun ekspedisi berhasil diupdate!' };
}

export async function deleteJourney(id) {
  await prisma.journey.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
}

export async function addMountain(prevState, formData) {
  const name = formData.get('name')?.trim();
  const journeyId = formData.get('journeyId');
  if (!name || !journeyId) return { error: 'Nama gunung dan tahun wajib dipilih.' };

  await prisma.mountain.create({ data: { name, journeyId } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
  return { success: 'Gunung berhasil ditambahkan!' };
}

export async function updateMountain(prevState, formData) {
  const id = formData.get('id');
  const name = formData.get('name')?.trim();
  if (!id || !name) return { error: 'ID dan nama gunung wajib diisi.' };

  await prisma.mountain.update({ where: { id }, data: { name } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
  return { success: 'Gunung berhasil diupdate!' };
}

export async function deleteMountain(id) {
  await prisma.mountain.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/journey');
}
