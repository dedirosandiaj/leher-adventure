'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return prisma.admin.findUnique({ where: { id: payload.id } });
}

export async function updateProfile(prevState, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return { error: 'Sesi tidak valid.' };

  const payload = await verifyToken(token);
  if (!payload) return { error: 'Sesi tidak valid.' };

  const username = formData.get('username')?.trim();
  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');

  const admin = await prisma.admin.findUnique({ where: { id: payload.id } });
  if (!admin) return { error: 'Admin tidak ditemukan.' };

  // Verify current password
  if (!(await bcrypt.compare(currentPassword, admin.password))) {
    return { error: 'Password saat ini salah.' };
  }

  const updateData = {};
  if (username && username !== admin.username) {
    // Check if username already exists
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing && existing.id !== admin.id) {
      return { error: 'Username sudah digunakan.' };
    }
    updateData.username = username;
  }

  if (newPassword) {
    updateData.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.admin.update({ where: { id: admin.id }, data: updateData });
  }

  return { success: 'Profil berhasil diupdate!' };
}

export async function addAdmin(prevState, formData) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return { error: 'Sesi tidak valid.' };

  const payload = await verifyToken(token);
  if (!payload) return { error: 'Sesi tidak valid.' };

  const username = formData.get('username')?.trim();
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    return { error: 'Username sudah digunakan.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.admin.create({
    data: { username, password: hashedPassword },
  });

  return { success: 'Admin baru berhasil ditambahkan!' };
}

export async function deleteAdmin(id) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return { error: 'Sesi tidak valid.' };

  const payload = await verifyToken(token);
  if (!payload) return { error: 'Sesi tidak valid.' };

  // Prevent deleting yourself
  if (id === payload.id) {
    return { error: 'Tidak bisa menghapus diri sendiri.' };
  }

  const admins = await prisma.admin.findMany();
  if (admins.length <= 1) {
    return { error: 'Minimal harus ada 1 admin.' };
  }

  await prisma.admin.delete({ where: { id } });
}
