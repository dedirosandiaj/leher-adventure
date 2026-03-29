'use server';

import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import { revalidatePath } from 'next/cache';
import sharp from 'sharp';

// Upload image to S3 with WebP compression
async function saveImageToS3(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const timestamp = Math.floor(Date.now() / 1000);
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${timestamp}-${originalName}.webp`;
  const key = `gallery/${filename}`;
  
  const compressedBuffer = await sharp(buffer)
    .webp({ quality: 80, effort: 6 })
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  
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
        image: imageUrl,
        order: 0
      }
    });
    
    revalidatePath('/portal-member/galeri');
    return { success: 'Gambar berhasil diupload!' };
  } catch (error) {
    console.error('Upload error:', error);
    return { error: 'Gagal upload gambar. Coba lagi.' };
  }
}
