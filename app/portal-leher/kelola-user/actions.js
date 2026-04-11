'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { deleteFromS3, getKeyFromUrl } from '@/lib/s3';

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'asc' }
  });
  return users;
}

export async function addUser(prevState, formData) {
  // Debug: log semua entries di formData
  console.log('addUser - formData entries:');
  for (const [key, value] of formData.entries()) {
    console.log(`  ${key}: ${value}`);
  }
  
  const username = formData.get('username')?.trim();
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.trim();
  const role = formData.get('role') || 'member';

  console.log('addUser parsed:', { username, name, email, role });

  if (!username) return { error: 'Username wajib diisi.' };
  if (!name) return { error: 'Nama wajib diisi.' };
  if (!email) return { error: 'Email wajib diisi.' };

  // Check if username already exists
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: 'Username sudah digunakan.' };

  // Check if email already exists
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { error: 'Email sudah digunakan.' };

  // Default password based on role
  const defaultPassword = role === 'admin' ? 'Passw0rdAdmin' : 'Passw0rdMember';

  // Hash password
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create user
  await prisma.user.create({
    data: { 
      username, 
      name,
      email,
      password: hashedPassword, 
      role: role.toUpperCase(),
      isTeam: role === 'member'
    }
  });

  revalidatePath('/portal-leher/kelola-user');
  revalidatePath('/portal-leher/team');
  revalidatePath('/');
  return { success: 'User berhasil ditambahkan!' };
}

export async function updateUser(prevState, formData) {
  const id = formData.get('id');
  const username = formData.get('username')?.trim();
  const name = formData.get('name')?.trim();
  const email = formData.get('email')?.trim();
  const password = formData.get('password');
  const role = formData.get('role');

  if (!id) return { error: 'ID user wajib diisi.' };
  if (!username) return { error: 'Username wajib diisi.' };
  if (!name) return { error: 'Nama wajib diisi.' };
  if (!email) return { error: 'Email wajib diisi.' };

  // Get current user data
  const currentUser = await prisma.user.findUnique({ where: { id } });
  if (!currentUser) return { error: 'User tidak ditemukan.' };

  // Check if username already exists (excluding current user)
  if (username !== currentUser.username) {
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return { error: 'Username sudah digunakan oleh user lain.' };
  }

  // Check if email already exists (excluding current user)
  if (email !== currentUser.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: 'Email sudah digunakan oleh user lain.' };
  }

  const data = { username, name, email, role };
  
  // Only update password if provided
  if (password && password.length > 0) {
    if (password.length < 6) return { error: 'Password minimal 6 karakter.' };
    data.password = await bcrypt.hash(password, 10);
  }

  // Update user
  await prisma.user.update({
    where: { id },
    data
  });

  revalidatePath('/portal-leher/kelola-user');
  revalidatePath('/portal-leher/team');
  revalidatePath('/');
  return { success: 'User berhasil diupdate!' };
}

export async function deleteUser(id) {
  if (!id) return { error: 'ID user wajib diisi.' };

  // Don't allow deleting yourself
  const cookieStore = await cookies();
  const currentAdminId = cookieStore.get('adminId')?.value;
  if (currentAdminId && currentAdminId === id) {
    return { error: 'Tidak bisa menghapus akun sendiri.' };
  }

  // Get user info before delete
  const user = await prisma.user.findUnique({ where: { id } });
  
  // Delete photo from S3 if exists
  if (user?.photo) {
    const key = getKeyFromUrl(user.photo);
    if (key) {
      try {
        await deleteFromS3(key);
      } catch (err) {
        console.error('Error deleting photo from S3:', err);
      }
    }
  }
  
  // Delete user
  await prisma.user.delete({ where: { id } });

  revalidatePath('/portal-leher/kelola-user');
  revalidatePath('/portal-leher/team');
  revalidatePath('/');
  return { success: 'User berhasil dihapus!' };
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get('adminId')?.value;
  if (!adminId) return null;
  
  const admin = await prisma.user.findUnique({
    where: { id: adminId }
  });
  return admin;
}
