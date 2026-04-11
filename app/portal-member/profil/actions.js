'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { uploadToS3, deleteFromS3, getKeyFromUrl } from '@/lib/s3';
import sharp from 'sharp';

// Helper untuk mendapatkan timestamp WIB (Indonesia)
function getWIBTimestamp() {
  const now = new Date();
  // WIB = UTC+7
  const wibOffset = 7 * 60 * 60 * 1000; // 7 jam dalam milliseconds
  const wibTime = new Date(now.getTime() + wibOffset);
  return Math.floor(wibTime.getTime() / 1000);
}

// Upload to S3 dengan kompresi WebP 50%
async function saveImageToS3(file, folder = 'team') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Compress dan convert ke WebP (kualitas 50%)
  const compressedBuffer = await sharp(buffer)
    .rotate() // Auto-rotate berdasarkan EXIF metadata
    .webp({ quality: 50, effort: 6 })
    .toBuffer();
  
  const timestamp = getWIBTimestamp();
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${timestamp}-${originalName}.webp`;
  const key = `${folder}/${filename}`;
  
  const url = await uploadToS3(compressedBuffer, key, 'image/webp');
  return url;
}

export async function updateProfile(prevState, formData) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get('memberId')?.value;
  
  console.log('UpdateProfile - memberId from cookie:', memberId);
  
  if (!memberId) {
    return { error: 'Sesi tidak valid.' };
  }
  
  const member = await prisma.user.findUnique({
    where: { id: memberId }
  });
  
  console.log('UpdateProfile - member found:', member);
  console.log('UpdateProfile - member.username:', member?.username);
  
  if (!member) {
    return { error: 'Akses ditolak. Member tidak ditemukan.' };
  }
  
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();
  const photoFile = formData.get('photoFile');
  const existingPhoto = formData.get('existingPhoto');
  
  // Jika member ini adalah team member (isTeam=true), update langsung
  // Jika bukan, cari team member yang ig-nya sama dengan username member
  let teamMember = member;
  
  if (!member.isTeam) {
    // Cari team member yang ig-nya sama dengan username member login
    const searchIg = member.username || ig;
    console.log('UpdateProfile - searching team member with ig:', searchIg);
    teamMember = await prisma.user.findFirst({
      where: { ig: searchIg, isTeam: true }
    });
    console.log('UpdateProfile - team member found:', teamMember);
    
    if (!teamMember) {
      return { error: 'Data team member tidak ditemukan. Hubungi admin.' };
    }
  } else {
    console.log('UpdateProfile - member is team member, updating directly');
  }
  
  let photo = existingPhoto || null;
  
  // Handle photo upload
  if (photoFile && photoFile.size > 0) {
    // Delete old photo if exists
    if (teamMember?.photo) {
      const oldKey = getKeyFromUrl(teamMember.photo);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
        } catch (err) {
          console.error('Error deleting old photo:', err);
        }
      }
    }
    
    photo = await saveImageToS3(photoFile, 'team');
  }
  
  // Update team member data
  await prisma.user.update({
    where: { id: teamMember.id },
    data: { name, ig, photo }
  });
  
  revalidatePath('/portal-member/profil');
  revalidatePath('/');
  return { success: 'Profil berhasil diupdate!' };
}
