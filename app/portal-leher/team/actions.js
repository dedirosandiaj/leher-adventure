'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
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

export async function addTeamMember(prevState, formData) {
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();
  const photoFile = formData.get('photoFile');

  console.log('Adding team member:', { name, ig, photoFile: photoFile?.name, photoFileSize: photoFile?.size });

  if (!name) return { error: 'Nama wajib diisi.' };
  if (!ig) return { error: 'Instagram handle wajib diisi.' };

  let photo = null;
  if (photoFile && photoFile.size > 0) {
    try {
      photo = await saveImageToS3(photoFile, 'team');
      console.log('Photo uploaded to S3:', photo);
    } catch (err) {
      console.error('Error uploading photo:', err);
      return { error: 'Gagal upload foto: ' + err.message };
    }
  }

  try {
    await prisma.user.create({ data: { name, ig, photo, isTeam: true } });
    console.log('Team member created with photo:', photo);
  } catch (err) {
    console.error('Error creating team member:', err);
    return { error: 'Gagal simpan ke database: ' + err.message };
  }
  
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
  return { success: 'Anggota tim berhasil ditambahkan!' };
}

export async function updateTeamMember(prevState, formData) {
  const id = formData.get('id');
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();
  const existingPhoto = formData.get('existingPhoto');
  const photoFile = formData.get('photoFile');

  if (!id || !name || !ig) return { error: 'ID, nama, dan Instagram wajib diisi.' };

  // Get current member data untuk hapus foto lama
  const currentMember = await prisma.user.findUnique({ where: { id } });

  let photo = existingPhoto || null;
  if (photoFile && photoFile.size > 0) {
    photo = await saveImageToS3(photoFile, 'team');
    
    // Hapus foto lama dari S3 jika ada dan berbeda dengan yang baru
    if (currentMember?.photo && currentMember.photo !== photo) {
      const oldKey = getKeyFromUrl(currentMember.photo);
      if (oldKey) {
        try {
          await deleteFromS3(oldKey);
          console.log('Deleted old photo from S3:', oldKey);
        } catch (err) {
          console.error('Error deleting old photo from S3:', err);
        }
      }
    }
  }

  await prisma.user.update({ where: { id }, data: { name, ig, photo } });
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
  return { success: 'Anggota tim berhasil diupdate!' };
}

export async function deleteTeamMember(id) {
  // Get member data untuk hapus file dari S3
  const member = await prisma.user.findUnique({ where: { id } });
  
  if (member?.photo) {
    // Hapus file dari S3
    const key = getKeyFromUrl(member.photo);
    if (key) {
      try {
        await deleteFromS3(key);
        console.log('Deleted from S3:', key);
      } catch (err) {
        console.error('Error deleting from S3:', err);
      }
    }
  }
  
  await prisma.user.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
  return { success: 'Anggota tim berhasil dihapus!' };
}
