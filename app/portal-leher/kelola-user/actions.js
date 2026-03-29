'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function getAllUsers() {
  const users = await prisma.admin.findMany({
    orderBy: { id: 'asc' }
  });
  return users;
}

export async function addUser(prevState, formData) {
  const username = formData.get('username')?.trim();
  const password = formData.get('password');
  const role = formData.get('role') || 'member';

  if (!username) return { error: 'Username wajib diisi.' };
  if (!password) return { error: 'Password wajib diisi.' };
  if (password.length < 6) return { error: 'Password minimal 6 karakter.' };

  // Check if username already exists
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) return { error: 'Username sudah digunakan.' };

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  await prisma.admin.create({
    data: { username, password: hashedPassword, role }
  });

  // If role is member, auto-create TeamMember entry
  if (role === 'member') {
    await prisma.teamMember.create({
      data: {
        name: '',
        ig: username,
        photo: null
      }
    });
  }

  revalidatePath('/portal-leher/kelola-user');
  revalidatePath('/portal-leher/team');
  revalidatePath('/');
  return { success: 'User berhasil ditambahkan!' };
}

export async function updateUser(prevState, formData) {
  const id = formData.get('id');
  const username = formData.get('username')?.trim();
  const password = formData.get('password');
  const role = formData.get('role');

  if (!id) return { error: 'ID user wajib diisi.' };
  if (!username) return { error: 'Username wajib diisi.' };

  // Check if username already exists (excluding current user)
  const existing = await prisma.admin.findFirst({
    where: { username, id: { not: parseInt(id) } }
  });
  if (existing) return { error: 'Username sudah digunakan oleh user lain.' };

  const data = { username, role };
  
  // Only update password if provided
  if (password && password.length > 0) {
    if (password.length < 6) return { error: 'Password minimal 6 karakter.' };
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.admin.update({
    where: { id: parseInt(id) },
    data
  });

  revalidatePath('/portal-leher/kelola-user');
  return { success: 'User berhasil diupdate!' };
}

export async function deleteUser(id) {
  if (!id) return { error: 'ID user wajib diisi.' };

  // Don't allow deleting yourself
  const cookieStore = await cookies();
  const currentAdminId = cookieStore.get('adminId')?.value;
  if (currentAdminId && parseInt(currentAdminId) === parseInt(id)) {
    return { error: 'Tidak bisa menghapus akun sendiri.' };
  }

  // Get user info before delete
  const user = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
  
  await prisma.admin.delete({ where: { id: parseInt(id) } });

  // If deleted user was member, also delete from TeamMember
  if (user?.role === 'member') {
    await prisma.teamMember.deleteMany({
      where: { name: user.username }
    });
  }

  revalidatePath('/portal-leher/kelola-user');
  revalidatePath('/portal-leher/team');
  revalidatePath('/');
  return { success: 'User berhasil dihapus!' };
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get('adminId')?.value;
  if (!adminId) return null;
  
  const admin = await prisma.admin.findUnique({
    where: { id: parseInt(adminId) }
  });
  return admin;
}
