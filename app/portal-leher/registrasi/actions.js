'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Calculate cost per member for a journey
async function calculateCostPerMember(journeyId) {
  try {
    // Get all expenses for this journey
    const expenses = await prisma.expense.findMany({
      where: { journeyId }
    });

    // Separate shared and individual expenses
    const SHARED_CATEGORIES = ['LOGISTICS', 'EQUIPMENT_RENTAL', 'OTHER'];
    const INDIVIDUAL_CATEGORIES = ['TRANSPORTATION', 'SIMAKSI'];

    const sharedTotal = expenses
      .filter(e => SHARED_CATEGORIES.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const individualTotal = expenses
      .filter(e => INDIVIDUAL_CATEGORIES.includes(e.category))
      .reduce((sum, e) => sum + e.amount, 0);

    // Get count of approved registrations
    const approvedCount = await prisma.journeyRegistration.count({
      where: { journeyId, status: 'APPROVED' }
    });

    // Shared cost divided by approved members
    const sharedCostPerMember = approvedCount > 0 ? Math.ceil(sharedTotal / approvedCount) : 0;
    // Individual cost is per person
    const individualCostPerMember = individualTotal;

    return sharedCostPerMember + individualCostPerMember;
  } catch (error) {
    console.error('Error calculating cost:', error);
    return 0;
  }
}


async function checkAuth() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;
  if (!adminSession) redirect('/login-leher');
}

// Get all registrations with filters
export async function getRegistrations(journeyId = null, status = null) {
  await checkAuth();

  try {
    const where = {};
    if (journeyId) where.journeyId = journeyId;
    if (status) where.status = status;

    const registrations = await prisma.journeyRegistration.findMany({
      where,
      include: {
        journey: {
          include: { 
            mountain: true,
            expenses: true
          }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add cost per member for approved registrations
    const registrationsWithCost = await Promise.all(
      registrations.map(async (reg) => {
        if (reg.status === 'APPROVED') {
          const costPerMember = await calculateCostPerMember(reg.journeyId);
          return { ...reg, costPerMember };
        }
        return { ...reg, costPerMember: null };
      })
    );

    return registrationsWithCost;
  } catch (error) {
    console.error('Error fetching registrations:', error);
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

// Update registration status
export async function updateRegistrationStatus(prevState, formData) {
  await checkAuth();

  const id = formData.get('id');
  const status = formData.get('status');

  if (!id || !status) {
    return { error: 'ID dan status wajib diisi.' };
  }

  try {
    await prisma.journeyRegistration.update({
      where: { id },
      data: { status }
    });

    revalidatePath('/portal-leher/registrasi');
    return { success: `Status berhasil diupdate ke ${status}.` };
  } catch (error) {
    console.error('Error updating registration:', error);
    return { error: 'Gagal mengupdate status.' };
  }
}

// Delete registration
export async function deleteRegistration(prevState, formData) {
  await checkAuth();

  const id = formData.get('id');

  if (!id) {
    return { error: 'ID wajib diisi.' };
  }

  try {
    // Delete registration from database
    await prisma.journeyRegistration.delete({
      where: { id }
    });

    revalidatePath('/portal-leher/registrasi');
    return { success: 'Registrasi berhasil dihapus.' };
  } catch (error) {
    console.error('Error deleting registration:', error);
    return { error: 'Gagal menghapus registrasi.' };
  }
}

// Get registration statistics
export async function getRegistrationStats() {
  await checkAuth();

  try {
    const [total, pending, approved, rejected] = await Promise.all([
      prisma.journeyRegistration.count(),
      prisma.journeyRegistration.count({ where: { status: 'PENDING' } }),
      prisma.journeyRegistration.count({ where: { status: 'APPROVED' } }),
      prisma.journeyRegistration.count({ where: { status: 'REJECTED' } })
    ]);

    return { total, pending, approved, rejected };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}
