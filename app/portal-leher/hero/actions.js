'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'hero');

// Ensure upload directory exists
function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Save uploaded file with compression and convert to WebP
async function saveImageFile(file) {
  ensureUploadDir();
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate unique filename (gunakan .webp extension)
  const timestamp = Date.now();
  const originalName = file.name.replace(/[^a-zA-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${timestamp}-${originalName}.webp`;
  const filepath = path.join(UPLOAD_DIR, filename);
  
  // Compress dan convert ke WebP menggunakan Sharp
  const compressedBuffer = await sharp(buffer)
    .webp({ 
      quality: 80, // Kualitas 80% (good balance antara kualitas dan ukuran)
      effort: 6,   // Compression effort (0-6, 6 = best compression)
    })
    .resize(1920, 1080, { // Max resolution Full HD
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
  
  await writeFile(filepath, compressedBuffer);
  
  // Return API URL for production, direct path for local
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return `/api/uploads/hero/${filename}`;
  }
  return `/uploads/hero/${filename}`;
}

export async function addHeroSlide(prevState, formData) {
  const imageFile = formData.get('imageFile');
  if (!imageFile || imageFile.size === 0) {
    return { error: 'File gambar wajib diupload.' };
  }
  
  const url = await saveImageFile(imageFile);
  
  // Order berdasarkan timestamp (terbaru di atas)
  const order = Date.now();

  await prisma.heroSlide.create({ data: { url, order } });
  revalidatePath('/');
  revalidatePath('/portal-leher/hero');
  return { success: 'Slide berhasil ditambahkan!' };
}

export async function deleteHeroSlide(id) {
  // Get slide data untuk hapus file gambar
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  
  if (slide?.url) {
    // Hapus file gambar dari folder uploads
    const filename = path.basename(slide.url);
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  }
  
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/hero');
}
