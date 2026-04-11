'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function loginAction(prevState, formData) {
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    // Cari user dengan role ADMIN
    const admin = await prisma.user.findFirst({ 
      where: { username, role: 'ADMIN' } 
    });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return { error: 'Username atau password salah!' };
    }

    const token = await signToken({ id: admin.id, username: admin.username, role: admin.role });
    
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: false, // Set to false for Coolify deployment (adjust if using HTTPS)
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Terjadi kesalahan sistem.' };
  }

  // Next.js redirect needs to happen outside the try/catch block 
  // because it throws a specific error that Next.js intercepts
  redirect('/portal-leher');
}

export async function resetPasswordAction(prevState, formData) {
  const username = formData.get('username')?.trim();

  if (!username) {
    return { error: 'Username wajib diisi!' };
  }

  try {
    // Cari user berdasarkan username
    const user = await prisma.user.findUnique({ 
      where: { username } 
    });
    
    if (!user) {
      return { error: 'User tidak ditemukan!' };
    }

    // Hash password default
    const defaultPassword = 'Passw0rdAdmin';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return { 
      success: `Password untuk "${username}" berhasil direset. Silakan login dengan password default.` 
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Terjadi kesalahan sistem.' };
  }
}
