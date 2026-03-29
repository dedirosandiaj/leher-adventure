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
async function saveImageToS3(file, folder = 'gallery') {
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

export async function addGalleryItem(prevState, formData) {
  const type = formData.get('type');
  const title = formData.get('title')?.trim();
  const imageFile = formData.get('imageFile');
  const url = formData.get('url')?.trim();

  if (type === 'video') {
    if (!url) return { error: 'Video ID wajib diisi.' };

    await prisma.gallery.create({ 
      data: { 
        type: 'video',
        title: title || 'Video', 
        image: url, 
        video_url: url,
        thumbnail: null
      } 
    });
  } else {
    // Image type
    if (!imageFile || imageFile.size === 0) return { error: 'File gambar wajib diupload.' };

    const imageUrl = await saveImageToS3(imageFile, 'gallery');

    await prisma.gallery.create({ 
      data: { 
        type: 'image',
        title: title || 'Gambar', 
        image: imageUrl
      } 
    });
  }

  revalidatePath('/');
  revalidatePath('/portal-leher/gallery');
  return { success: 'Item galeri berhasil ditambahkan!' };
}

export async function deleteGalleryItem(id) {
  // Get item data untuk hapus file dari S3
  const item = await prisma.gallery.findUnique({ where: { id } });
  
  // Hapus image/thumbnail dari S3
  const urlToDelete = item?.type === 'video' ? item?.thumbnail : item?.image;
  if (urlToDelete) {
    const key = getKeyFromUrl(urlToDelete);
    if (key) {
      try {
        await deleteFromS3(key);
        console.log('Deleted from S3:', key);
      } catch (err) {
        console.error('Error deleting from S3:', err);
      }
    }
  }
  
  await prisma.gallery.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/gallery');
  return { success: 'Item galeri berhasil dihapus!' };
}
