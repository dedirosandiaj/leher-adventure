'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { uploadToS3, deleteFromS3, getKeyFromUrl } from '@/lib/s3';
import sharp from 'sharp';

// Upload to S3 with compression and convert to WebP
async function saveImageToS3(file, folder = 'gallery') {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Generate unique filename (gunakan .webp extension)
  const timestamp = Math.floor(Date.now() / 1000);
  const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
  const filename = `${timestamp}-${originalName}.webp`;
  const key = `${folder}/${filename}`;
  
  // Compress dan convert ke WebP menggunakan Sharp
  const compressedBuffer = await sharp(buffer)
    .webp({ 
      quality: 80,
      effort: 6,
    })
    .resize(1200, 800, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
  
  // Upload ke S3
  const url = await uploadToS3(compressedBuffer, key, 'image/webp');
  
  return url;
}

export async function addGalleryItem(prevState, formData) {
  const type = formData.get('type');
  const title = formData.get('title')?.trim();
  const imageFile = formData.get('imageFile');
  const url = formData.get('url')?.trim();

  // Order diisi dengan timestamp agar yang terbaru di atas
  const order = Math.floor(Date.now() / 1000);

  if (type === 'video') {
    if (!url) return { error: 'Video ID wajib diisi.' };

    await prisma.gallery.create({ 
      data: { 
        type: 'video',
        title: title || 'Video', 
        image: url, 
        video_url: url,
        thumbnail: null,
        order 
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
        image: imageUrl,
        order 
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
