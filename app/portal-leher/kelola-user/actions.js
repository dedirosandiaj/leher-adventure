'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { deleteFromS3, getKeyFromUrl } from '@/lib/s3';

export async function getAllUsers() {
  const users = await prisma.admin.findMany({
    orderBy: { id: 'asc' }
  });
  return users;
}

export async function addUser(prevState, formData) {
  const username = formData.get('username')?.trim();
  const role = formData.get('role') || 'member';

  if (!username) return { error: 'Username wajib diisi.' };

  // Check if username already exists
  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) return { error: 'Username sudah digunakan.' };

  // Default password based on role
  const defaultPassword = role === 'admin' ? 'Passw0rdAdmin' : 'Passw0rdMember';

  // Hash password
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  // Create user
  await prisma.admin.create({
    data: { username, password: hashedPassword, role }
  });

  // If role is member, auto-create TeamMember entry
  if (role === 'member') {
    await prisma.teamMember.create({
      data: {
        name: username,
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

  // Get current user data
  const currentUser = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
  if (!currentUser) return { error: 'User tidak ditemukan.' };

  // Check if username already exists (excluding current user)
  const allUsers = await prisma.admin.findMany();
  const existing = allUsers.find(u => u.username === username && u.id !== parseInt(id));
  if (existing) return { error: 'Username sudah digunakan oleh user lain.' };

  const data = { username, role };
  
  // Only update password if provided
  if (password && password.length > 0) {
    if (password.length < 6) return { error: 'Password minimal 6 karakter.' };
    data.password = await bcrypt.hash(password, 10);
  }

  // Update Admin
  await prisma.admin.update({
    where: { id: parseInt(id) },
    data
  });

  // Sync TeamMember if user is/was a member
  if (currentUser.role === 'member' || role === 'member') {
    const teamMember = await prisma.teamMember.findFirst({
      where: { ig: currentUser.username }
    });

    if (teamMember) {
      // Update ig in TeamMember if username changed
      if (currentUser.username !== username) {
        await prisma.teamMember.update({
          where: { id: teamMember.id },
          data: { ig: username }
        });
      }
      
      // If role changed from member to admin, delete from TeamMember
      if (currentUser.role === 'member' && role === 'admin') {
        // Delete photo from S3 if exists
        if (teamMember.photo) {
          const key = getKeyFromUrl(teamMember.photo);
          if (key) {
            try {
              await deleteFromS3(key);
            } catch (err) {
              console.error('Error deleting photo from S3:', err);
            }
          }
        }
        await prisma.teamMember.delete({ where: { id: teamMember.id } });
      }
    } else if (currentUser.role === 'admin' && role === 'member') {
      // If role changed from admin to member, create TeamMember
      await prisma.teamMember.create({
        data: {
          name: username,
          ig: username,
          photo: null
        }
      });
    }
  }

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
  if (currentAdminId && parseInt(currentAdminId) === parseInt(id)) {
    return { error: 'Tidak bisa menghapus akun sendiri.' };
  }

  // Get user info before delete
  const user = await prisma.admin.findUnique({ where: { id: parseInt(id) } });
  
  // If deleted user was member, delete from TeamMember and S3 photo
  if (user?.role === 'member') {
    const teamMember = await prisma.teamMember.findFirst({
      where: { ig: user.username }
    });
    
    if (teamMember) {
      // Delete photo from S3 if exists
      if (teamMember.photo) {
        const key = getKeyFromUrl(teamMember.photo);
        if (key) {
          try {
            await deleteFromS3(key);
          } catch (err) {
            console.error('Error deleting photo from S3:', err);
          }
        }
      }
      
      // Delete from TeamMember
      await prisma.teamMember.delete({
        where: { id: teamMember.id }
      });
    }
  }
  
  // Delete from Admin
  await prisma.admin.delete({ where: { id: parseInt(id) } });

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
