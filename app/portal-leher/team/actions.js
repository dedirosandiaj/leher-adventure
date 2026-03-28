'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'team');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Save uploaded file with compression and convert to WebP
async function savePhotoFile(file) {
  ensureUploadDir();
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate unique filename (gunakan .webp extension)
  const timestamp = Date.now();
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${timestamp}-${originalName}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Compress dan convert ke WebP menggunakan Sharp
  const compressedBuffer = await sharp(buffer)
    .webp({ 
      quality: 80, // Kualitas 80% (good balance antara kualitas dan ukuran)
      effort: 6,   // Compression effort (0-6, 6 = best compression)
    })
    .resize(400, 400, { // Max resolution 400x400 untuk foto profile
      fit: 'cover',
      withoutEnlargement: true,
    })
    .toBuffer();
  
  await writeFile(filepath, compressedBuffer);
  
  // Return relative URL
  return `/uploads/team/${filename}`;
}

export async function addTeamMember(prevState, formData) {
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();

  if (!name || !ig) return { error: 'Nama dan Instagram wajib diisi.' };

  let photo = null;
  const photoFile = formData.get('photoFile');
  if (photoFile && photoFile.size > 0) {
    photo = await savePhotoFile(photoFile);
  }

  // Order berdasarkan timestamp
  const order = Date.now();

  await prisma.teamMember.create({
    data: { name, ig, photo, order },
  });
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
  return { success: 'Anggota berhasil ditambahkan!' };
}

export async function updateTeamMember(prevState, formData) {
  const id = formData.get('id');
  const name = formData.get('name')?.trim();
  const ig = formData.get('ig')?.trim();
  const existingPhoto = formData.get('existingPhoto');

  if (!id || !name || !ig) return { error: 'ID, nama, dan Instagram wajib diisi.' };

  let photo = existingPhoto || null;
  const photoFile = formData.get('photoFile');
  if (photoFile && photoFile.size > 0) {
    photo = await savePhotoFile(photoFile);
  }

  await prisma.teamMember.update({
    where: { id },
    data: { name, ig, photo },
  });
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
  return { success: 'Anggota berhasil diupdate!' };
}

export async function deleteTeamMember(id) {
  // Get member data untuk hapus file foto
  const member = await prisma.teamMember.findUnique({ where: { id } });
  
  if (member?.photo) {
    // Hapus file foto dari folder uploads
    const filename = path.basename(member.photo);
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
  
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/team');
}
