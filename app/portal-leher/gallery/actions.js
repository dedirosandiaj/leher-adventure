'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile, unlink } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');

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
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
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
  
  // Return relative URL
  return `/uploads/gallery/${filename}`;
}

export async function addGalleryItem(prevState, formData) {
  const type = formData.get('type');

  if (!type) return { error: 'Tipe media wajib dipilih.' };

  let url, thumbnail = null;

  if (type === 'image') {
    const imageFile = formData.get('imageFile');
    if (!imageFile || imageFile.size === 0) {
      return { error: 'File gambar wajib diupload.' };
    }
    url = await saveImageFile(imageFile);
  } else {
    url = formData.get('url')?.trim();
    if (!url) return { error: 'YouTube Video ID wajib diisi.' };
    
    // Upload thumbnail file untuk video
    const thumbnailFile = formData.get('thumbnailFile');
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnail = await saveImageFile(thumbnailFile);
    }
  }

  // Order diisi dengan timestamp agar yang terbaru di atas
  const order = Date.now();

  await prisma.gallery.create({ data: { type, url, thumbnail, order } });
  revalidatePath('/');
  revalidatePath('/portal-leher/gallery');
  return { success: 'Item galeri berhasil ditambahkan!' };
}

export async function updateGalleryItem(prevState, formData) {
  const id = formData.get('id');
  const type = formData.get('type');
  const existingUrl = formData.get('existingUrl');
  const existingThumbnail = formData.get('existingThumbnail');

  if (!id || !type) return { error: 'ID dan tipe wajib diisi.' };

  let url, thumbnail = null;

  if (type === 'image') {
    const imageFile = formData.get('imageFile');
    if (imageFile && imageFile.size > 0) {
      // New file uploaded
      url = await saveImageFile(imageFile);
    } else if (existingUrl) {
      // Keep existing file
      url = existingUrl;
    } else {
      return { error: 'File gambar wajib diupload.' };
    }
  } else {
    url = formData.get('url')?.trim();
    if (!url) return { error: 'YouTube Video ID wajib diisi.' };
    
    // Upload thumbnail file jika ada
    const thumbnailFile = formData.get('thumbnailFile');
    if (thumbnailFile && thumbnailFile.size > 0) {
      thumbnail = await saveImageFile(thumbnailFile);
    } else if (existingThumbnail) {
      // Keep existing thumbnail
      thumbnail = existingThumbnail;
    }
  }

  // Tidak update order, biarkan tetap seperti semula
  await prisma.gallery.update({ where: { id }, data: { type, url, thumbnail } });
  revalidatePath('/');
  revalidatePath('/portal-leher/gallery');
  return { success: 'Item galeri berhasil diupdate!' };
}

export async function deleteGalleryItem(id) {
  // Get item data untuk hapus file gambar
  const item = await prisma.gallery.findUnique({ where: { id } });
  
  if (item) {
    // Hapus file gambar/url jika ada
    if (item.url && item.type === 'image') {
      const filename = path.basename(item.url);
      const filepath = path.join(UPLOAD_DIR, filename);
      try {
        if (existsSync(filepath)) {
          await unlink(filepath);
        }
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    
    // Hapus thumbnail jika ada
    if (item.thumbnail) {
      const thumbFilename = path.basename(item.thumbnail);
      const thumbFilepath = path.join(UPLOAD_DIR, thumbFilename);
      try {
        if (existsSync(thumbFilepath)) {
          await unlink(thumbFilepath);
        }
      } catch (err) {
        console.error('Error deleting thumbnail:', err);
      }
    }
  }
  
  await prisma.gallery.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/gallery');
}
