'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { uploadToS3, deleteFromS3, getKeyFromUrl } from '@/lib/s3';
import sharp from 'sharp';

// Upload to S3 dengan kompresi WebP 50%
async function saveImageToS3(file, folder = 'team') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Compress dan convert ke WebP (kualitas 50%)
  const compressedBuffer = await sharp(buffer)
    .webp({ quality: 50, effort: 6 })
    .toBuffer();
  
  const timestamp = Math.floor(Date.now() / 1000);
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
  console.log('UpdateProfile - parsedInt:', parseInt(memberId));
  
  if (!memberId) {
    return { error: 'Sesi tidak valid.' };
  }
  
  const parsedId = parseInt(memberId);
  if (isNaN(parsedId)) {
    console.log('UpdateProfile - parsedId is NaN');
    return { error: 'Akses ditolak. ID tidak valid.' };
  }
  
  const member = await prisma.admin.findUnique({
    where: { id: parsedId }
  });
  
  console.log('UpdateProfile - member found:', member);
  
  if (!member) {
    return { error: 'Akses ditolak. Member tidak ditemukan.' };
  }
  
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();
  const photoFile = formData.get('photoFile');
  const existingPhoto = formData.get('existingPhoto');
  
  // Get team member
  let teamMember = await prisma.teamMember.findFirst({
    where: { ig: member.username }
  });
  
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
  
  // Update or create team member
  if (teamMember) {
    await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { name, ig, photo }
    });
  } else {
    await prisma.teamMember.create({
      data: { name, ig, photo }
    });
  }
  
  revalidatePath('/portal-member/profil');
  revalidatePath('/');
  return { success: 'Profil berhasil diupdate!' };
}
