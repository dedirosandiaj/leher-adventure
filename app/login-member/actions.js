'use server';

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

export async function loginMember(prevState, formData) {
  const username = formData.get('username')?.trim();
  const password = formData.get('password');

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  const user = await prisma.admin.findUnique({ where: { username } });
  
  if (!user) {
    return { error: 'Username atau password salah.' };
  }

  // Only allow member role
  if (user.role !== 'member') {
    return { error: 'Akses khusus member. Silakan login di portal admin.' };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return { error: 'Username atau password salah.' };
  }

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set('memberId', user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/portal-member');
}

export async function logoutMember() {
  'use server';
  const cookieStore = await cookies();
  cookieStore.delete('memberId');
  redirect('/login-member');
}

export async function getCurrentMember() {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  if (!memberId) return null;
  
  const member = await prisma.admin.findUnique({
    where: { id: parseInt(memberId) }
  });
  
  return member;
}
