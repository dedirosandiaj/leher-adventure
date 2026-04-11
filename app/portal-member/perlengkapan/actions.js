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

// Get all equipment items with categories
export async function getEquipmentItems() {
  try {
    const items = await prisma.equipmentItem.findMany({
      orderBy: { createdAt: 'asc' },
      include: { category: true }
    });
    return items;
  } catch (error) {
    console.error('Error fetching equipment items:', error);
    return [];
  }
}

// Get member's equipment checklist
export async function getMemberEquipment() {
  const member = await getCurrentMember();
  if (!member || !member.id) return {};

  try {
    const items = await prisma.userEquipment.findMany({
      where: { userId: member.id }
    });
    
    // Convert to object: { itemId: true } for checked items
    const checklist = {};
    items.forEach(item => {
      checklist[item.itemId] = true;
    });
    
    return checklist;
  } catch (error) {
    console.error('Error fetching member equipment:', error);
    return {};
  }
}

// Toggle equipment checked status
export async function toggleEquipment(itemId, checked) {
  const member = await getCurrentMember();
  if (!member || !member.id) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    if (checked) {
      // Insert when checked (ignore if already exists)
      await prisma.userEquipment.create({
        data: {
          userId: member.id,
          itemId: itemId
        }
      });
    } else {
      // Delete when unchecked
      await prisma.userEquipment.deleteMany({
        where: {
          userId: member.id,
          itemId: itemId
        }
      });
    }

    revalidatePath('/portal-member/perlengkapan');
    return { success: true };
  } catch (error) {
    // Ignore unique constraint violation (already checked)
    if (error.code === 'P2002') {
      return { success: true };
    }
    console.error('Error toggling equipment:', error);
    return { success: false, error: error.message };
  }
}
