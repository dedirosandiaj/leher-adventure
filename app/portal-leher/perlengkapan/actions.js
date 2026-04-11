'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==================== CATEGORY ACTIONS ====================

export async function getCategories() {
  const categories = await prisma.equipmentCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });
  return categories;
}

export async function addCategory(prevState, formData) {
  const name = formData.get('name')?.trim();
  const order = parseInt(formData.get('order') || '0');

  if (!name) {
    return { error: 'Nama kategori wajib diisi.' };
  }

  try {
    await prisma.equipmentCategory.create({
      data: { name, order }
    });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Kategori berhasil ditambahkan!' };
  } catch (error) {
    if (error.code === 'P2002') {
      return { error: 'Nama kategori sudah digunakan.' };
    }
    console.error('Add category error:', error);
    return { error: 'Terjadi kesalahan saat menambah kategori.' };
  }
}

export async function updateCategory(prevState, formData) {
  const id = formData.get('id');
  const name = formData.get('name')?.trim();
  const order = parseInt(formData.get('order') || '0');

  if (!id) return { error: 'ID kategori wajib diisi.' };
  if (!name) return { error: 'Nama kategori wajib diisi.' };

  try {
    await prisma.equipmentCategory.update({
      where: { id },
      data: { name, order }
    });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Kategori berhasil diupdate!' };
  } catch (error) {
    if (error.code === 'P2002') {
      return { error: 'Nama kategori sudah digunakan.' };
    }
    console.error('Update category error:', error);
    return { error: 'Terjadi kesalahan saat mengupdate kategori.' };
  }
}

export async function deleteCategory(id) {
  if (!id) return { error: 'ID kategori wajib diisi.' };

  try {
    await prisma.equipmentCategory.delete({ where: { id } });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Kategori berhasil dihapus!' };
  } catch (error) {
    console.error('Delete category error:', error);
    return { error: 'Terjadi kesalahan saat menghapus kategori.' };
  }
}

// ==================== ITEM ACTIONS ====================

export async function getItems() {
  const items = await prisma.equipmentItem.findMany({
    orderBy: { createdAt: 'asc' },
    include: { category: true }
  });
  return items;
}

export async function addItem(prevState, formData) {
  const name = formData.get('name')?.trim();
  const description = formData.get('description')?.trim();
  const categoryId = formData.get('categoryId');
  const required = formData.get('required') === 'on';

  if (!name) {
    return { error: 'Nama item wajib diisi.' };
  }
  if (!categoryId) {
    return { error: 'Kategori wajib dipilih.' };
  }

  try {
    await prisma.equipmentItem.create({
      data: {
        name,
        description,
        categoryId,
        required
      }
    });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Item berhasil ditambahkan!' };
  } catch (error) {
    console.error('Add item error:', error);
    return { error: 'Terjadi kesalahan saat menambah item.' };
  }
}

export async function updateItem(prevState, formData) {
  const id = formData.get('id');
  const name = formData.get('name')?.trim();
  const description = formData.get('description')?.trim();
  const categoryId = formData.get('categoryId');
  const required = formData.get('required') === 'on';

  if (!id) return { error: 'ID item wajib diisi.' };
  if (!name) return { error: 'Nama item wajib diisi.' };
  if (!categoryId) return { error: 'Kategori wajib dipilih.' };

  try {
    await prisma.equipmentItem.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        required
      }
    });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Item berhasil diupdate!' };
  } catch (error) {
    console.error('Update item error:', error);
    return { error: 'Terjadi kesalahan saat mengupdate item.' };
  }
}

export async function deleteItem(id) {
  if (!id) return { error: 'ID item wajib diisi.' };

  try {
    await prisma.equipmentItem.delete({ where: { id } });
    revalidatePath('/portal-leher/perlengkapan');
    return { success: 'Item berhasil dihapus!' };
  } catch (error) {
    console.error('Delete item error:', error);
    return { error: 'Terjadi kesalahan saat menghapus item.' };
  }
}
