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
    // Scaffold initial admin if the Database is entirely empty 
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
       const hash = await bcrypt.hash('admin123', 10);
       await prisma.admin.create({ data: { username: 'admin', password: hash } });
    }

    const admin = await prisma.admin.findUnique({ where: { username } });
    
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return { error: 'Username atau password salah!' };
    }

    const token = await signToken({ id: admin.id, username: admin.username });
    
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
