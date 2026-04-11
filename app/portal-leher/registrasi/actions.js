'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { deleteFromS3, getKeyFromUrl } from '@/lib/s3';

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
          include: { mountain: true }
        },
        user: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return registrations;
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
    // Get registration to get the KTP photo URL
    const registration = await prisma.journeyRegistration.findUnique({
      where: { id }
    });

    if (!registration) {
      return { error: 'Registrasi tidak ditemukan.' };
    }

    // Delete KTP photo from S3
    if (registration.ktpPhoto) {
      const key = getKeyFromUrl(registration.ktpPhoto);
      if (key) {
        try {
          await deleteFromS3(key);
        } catch (s3Error) {
          console.error('Error deleting KTP photo from S3:', s3Error);
          // Continue with deletion even if S3 delete fails
        }
      }
    }

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
