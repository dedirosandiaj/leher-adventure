'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';


async function getCurrentMember() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  if (!memberId) return null;
  
  const member = await prisma.user.findUnique({
    where: { id: memberId }
  });
  
  return member;
}

// Get member's equipment progress (only required items)
export async function getEquipmentProgress() {
  const member = await getCurrentMember();
  if (!member || !member.id) return { totalRequired: 0, checkedRequired: 0, progress: 0 };

  try {
    // Get all required equipment items
    const requiredItems = await prisma.equipmentItem.findMany({
      where: { required: true }
    });
    
    // Get member's checked items
    const checkedItems = await prisma.userEquipment.findMany({
      where: { userId: member.id }
    });
    
    const totalRequired = requiredItems.length;
    const checkedRequired = checkedItems.filter(ci => 
      requiredItems.some(ri => ri.id === ci.itemId)
    ).length;
    
    const progress = totalRequired > 0 ? Math.round((checkedRequired / totalRequired) * 100) : 0;
    
    return { totalRequired, checkedRequired, progress };
  } catch (error) {
    console.error('Error fetching equipment progress:', error);
    return { totalRequired: 0, checkedRequired: 0, progress: 0 };
  }
}

// Check if member already registered for a journey
export async function checkRegistration(journeyId) {
  const member = await getCurrentMember();
  if (!member || !member.id) return null;

  try {
    const registration = await prisma.journeyRegistration.findUnique({
      where: {
        journeyId_userId: {
          journeyId,
          userId: member.id
        }
      }
    });
    return registration;
  } catch (error) {
    console.error('Error checking registration:', error);
    return null;
  }
}

// Register for a journey
export async function registerJourney(prevState, formData) {
  const member = await getCurrentMember();
  if (!member || !member.id) {
    return { error: 'Sesi tidak valid. Silakan login ulang.' };
  }

  const journeyId = formData.get('journeyId');
  const phone = formData.get('phone')?.trim();
  const email = formData.get('email')?.trim();

  // Validasi
  if (!journeyId) return { error: 'Journey ID wajib diisi.' };
  if (!phone) return { error: 'Nomor HP wajib diisi.' };
  if (!email) return { error: 'Email wajib diisi.' };

  // Cek apakah sudah terdaftar
  const existing = await prisma.journeyRegistration.findUnique({
    where: {
      journeyId_userId: {
        journeyId,
        userId: member.id
      }
    }
  });
  
  if (existing) {
    return { error: 'Anda sudah mendaftar untuk pendakian ini.' };
  }

  try {
    // Create registration
    await prisma.journeyRegistration.create({
      data: {
        journeyId,
        userId: member.id,
        phone,
        email,
        status: 'PENDING'
      }
    });

    revalidatePath('/portal-member');
    return { success: 'Pendaftaran berhasil! Menunggu konfirmasi admin.' };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'Terjadi kesalahan saat mendaftar. Coba lagi.' };
  }
}

// Get expense details for a journey
export async function getJourneyExpenses(journeyId) {
  const member = await getCurrentMember();
  if (!member || !member.id) return { expenses: [], total: 0, approvedCount: 0, costPerMember: 0, sharedCost: 0, individualCost: 0 };

  try {
    // Get all expenses for this journey
    const expenses = await prisma.expense.findMany({
      where: { journeyId },
      orderBy: { date: 'desc' }
    });

    // Separate shared and individual expenses
    const SHARED_CATEGORIES = ['LOGISTICS', 'EQUIPMENT_RENTAL', 'OTHER'];
    const INDIVIDUAL_CATEGORIES = ['TRANSPORTATION', 'SIMAKSI'];

    const sharedExpenses = expenses.filter(e => SHARED_CATEGORIES.includes(e.category));
    const individualExpenses = expenses.filter(e => INDIVIDUAL_CATEGORIES.includes(e.category));

    const sharedTotal = sharedExpenses.reduce((sum, e) => sum + e.amount, 0);
    const individualTotal = individualExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Get count of approved registrations
    const approvedCount = await prisma.journeyRegistration.count({
      where: {
        journeyId,
        status: 'APPROVED'
      }
    });

    // Shared cost divided by approved members
    const sharedCostPerMember = approvedCount > 0 ? Math.ceil(sharedTotal / approvedCount) : sharedTotal;
    // Individual cost is per person (not divided)
    const individualCostPerMember = individualTotal;

    const total = sharedTotal + individualTotal;
    const costPerMember = sharedCostPerMember + individualCostPerMember;

    return { 
      expenses, 
      total, 
      approvedCount, 
      costPerMember,
      sharedCost: sharedCostPerMember,
      individualCost: individualCostPerMember,
      sharedTotal,
      individualTotal
    };
  } catch (error) {
    console.error('Error fetching journey expenses:', error);
    return { expenses: [], total: 0, approvedCount: 0, costPerMember: 0, sharedCost: 0, individualCost: 0 };
  }
}
