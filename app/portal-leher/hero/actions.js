'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { uploadToS3, deleteFromS3, getKeyFromUrl } from '@/lib/s3';
import sharp from 'sharp';

// Upload to S3 with compression and convert to WebP
async function saveImageToS3(file, folder = 'hero') {
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
      quality: 80, // Kualitas 80% (good balance antara kualitas dan ukuran)
      effort: 6,   // Compression effort (0-6, 6 = best compression)
    })
    .resize(1920, 1080, { // Max resolution Full HD
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
  
  // Upload ke S3
  const url = await uploadToS3(compressedBuffer, key, 'image/webp');
  
  return url;
}

export async function addHeroSlide(prevState, formData) {
  const imageFile = formData.get('imageFile');
  if (!imageFile || imageFile.size === 0) {
    return { error: 'File gambar wajib diupload.' };
  }
  
  const url = await saveImageToS3(imageFile, 'hero');
  console.log('Saving hero slide with URL:', url);
  
  // Order berdasarkan timestamp (terbaru di atas) - gunakan seconds bukan milliseconds
  const order = Math.floor(Date.now() / 1000);

  try {
    await prisma.heroSlide.create({ data: { image: url, order } });
    console.log('Hero slide saved successfully');
  } catch (err) {
    console.error('Error saving hero slide:', err);
    throw err;
  }
  revalidatePath('/');
  revalidatePath('/portal-leher/hero');
  return { success: 'Slide berhasil ditambahkan!' };
}

export async function deleteHeroSlide(id) {
  // Get slide data untuk hapus file dari S3
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  
  if (slide?.image) {
    // Hapus file dari S3
    const key = getKeyFromUrl(slide.image);
    if (key) {
      try {
        await deleteFromS3(key);
        console.log('Deleted from S3:', key);
      } catch (err) {
        console.error('Error deleting from S3:', err);
      }
    }
  }
  
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath('/');
  revalidatePath('/portal-leher/hero');
  return { success: 'Slide berhasil dihapus!' };
}
