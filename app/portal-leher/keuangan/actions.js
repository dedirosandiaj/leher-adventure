'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkAuth() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (!adminSession) redirect('/login-leher');
}

// Get all expenses with filters
export async function getExpenses(journeyId = null, category = null) {
  await checkAuth();

  try {
    const where = {};
    if (journeyId) where.journeyId = journeyId;
    if (category) where.category = category;

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        journey: {
          include: { mountain: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return expenses;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
}

// Get all journeys for filter
export async function getJourneys() {
  await checkAuth();

  try {
    const journeys = await prisma.journey.findMany({
      include: { mountain: true },
      orderBy: { year: 'desc' }
    });
    return journeys;
  } catch (error) {
    console.error('Error fetching journeys:', error);
    return [];
  }
}

// Create expense
export async function createExpense(prevState, formData) {
  await checkAuth();

  const title = formData.get('title')?.trim();
  const amount = parseInt(formData.get('amount') || '0');
  const category = formData.get('category');
  const journeyId = formData.get('journeyId') || null;
  const description = formData.get('description')?.trim() || null;
  const dateStr = formData.get('date');

  // Validasi
  if (!title) return { error: 'Judul wajib diisi.' };
  if (!amount || amount <= 0) return { error: 'Jumlah wajib diisi dan harus lebih dari 0.' };
  if (!category) return { error: 'Kategori wajib dipilih.' };

  try {
    await prisma.expense.create({
      data: {
        title,
        amount,
        category,
        journeyId: journeyId || null,
        description,
        date: dateStr ? new Date(dateStr) : new Date()
      }
    });

    revalidatePath('/portal-leher/keuangan');
    return { success: 'Pengeluaran berhasil ditambahkan.' };
  } catch (error) {
    console.error('Error creating expense:', error);
    return { error: 'Gagal menambahkan pengeluaran.' };
  }
}

// Update expense
export async function updateExpense(prevState, formData) {
  await checkAuth();

  const id = formData.get('id');
  const title = formData.get('title')?.trim();
  const amount = parseInt(formData.get('amount') || '0');
  const category = formData.get('category');
  const journeyId = formData.get('journeyId') || null;
  const description = formData.get('description')?.trim() || null;
  const dateStr = formData.get('date');

  if (!id) return { error: 'ID wajib diisi.' };
  if (!title) return { error: 'Judul wajib diisi.' };
  if (!amount || amount <= 0) return { error: 'Jumlah wajib diisi dan harus lebih dari 0.' };
  if (!category) return { error: 'Kategori wajib dipilih.' };

  try {
    await prisma.expense.update({
      where: { id },
      data: {
        title,
        amount,
        category,
        journeyId: journeyId || null,
        description,
        date: dateStr ? new Date(dateStr) : undefined
      }
    });

    revalidatePath('/portal-leher/keuangan');
    return { success: 'Pengeluaran berhasil diupdate.' };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { error: 'Gagal mengupdate pengeluaran.' };
  }
}

// Delete expense
export async function deleteExpense(prevState, formData) {
  await checkAuth();

  const id = formData.get('id');

  if (!id) return { error: 'ID wajib diisi.' };

  try {
    await prisma.expense.delete({
      where: { id }
    });

    revalidatePath('/portal-leher/keuangan');
    return { success: 'Pengeluaran berhasil dihapus.' };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { error: 'Gagal menghapus pengeluaran.' };
  }
}

// Get expense statistics
export async function getExpenseStats(journeyId = null) {
  await checkAuth();

  try {
    const where = journeyId ? { journeyId } : {};

    const expenses = await prisma.expense.findMany({
      where,
      select: { amount: true, category: true }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    const byCategory = {
      LOGISTICS: 0,
      SIMAKSI: 0,
      TRANSPORTATION: 0,
      EQUIPMENT_RENTAL: 0,
      OTHER: 0
    };

    expenses.forEach(e => {
      if (byCategory[e.category] !== undefined) {
        byCategory[e.category] += e.amount;
      }
    });

    return { total, byCategory, count: expenses.length };
  } catch (error) {
    console.error('Error fetching expense stats:', error);
    return { total: 0, byCategory: {}, count: 0 };
  }
}
