'use server';

import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';

// Helper untuk mendapatkan timestamp WIB (Indonesia)
function getWIBTimestamp() {
  const now = new Date();
  // WIB = UTC+7
  const wibOffset = 7 * 60 * 60 * 1000; // 7 jam dalam milliseconds
  const wibTime = new Date(now.getTime() + wibOffset);
  return Math.floor(wibTime.getTime() / 1000);
}

// Upload image to S3 dengan kompresi WebP 50%
async function saveImageToS3(file) {
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
  const key = `gallery/${filename}`;
  
  const url = await uploadToS3(compressedBuffer, key, 'image/webp');
  return url;
}

export async function uploadGalleryImage(prevState, formData) {
  try {
    const file = formData.get('image');
    const title = formData.get('title')?.trim() || 'Gallery Image';
    
    if (!file || file.size === 0) {
      return { error: 'Pilih gambar terlebih dahulu.' };
    }
    
    // Upload to S3
    const imageUrl = await saveImageToS3(file);
    
    // Save to database
    await prisma.gallery.create({
      data: {
        type: 'image',
        title,
        image: imageUrl
      }
    });
    
    revalidatePath('/portal-member/galeri');
    return { success: 'Gambar berhasil diupload!' };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Gagal upload gambar. Coba lagi.' };
  }
}
