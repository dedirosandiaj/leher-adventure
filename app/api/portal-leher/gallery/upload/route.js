import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';

// Helper untuk mendapatkan timestamp WIB (Indonesia)
function getWIBTimestamp() {
  const now = new Date();
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibTime = new Date(now.getTime() + wibOffset);
  return Math.floor(wibTime.getTime() / 1000);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile');
    const title = formData.get('title')?.trim() || 'Gambar';
    
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: 'File gambar wajib diupload.' }, { status: 400 });
    }
    
    // Compress dan convert ke WebP (kualitas 50%)
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const compressedBuffer = await sharp(buffer)
      .rotate()
      .webp({ quality: 50, effort: 6 })
      .toBuffer();
    
    const timestamp = getWIBTimestamp();
    const originalName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
    const filename = `${timestamp}-${originalName}.webp`;
    const key = `gallery/${filename}`;
    
    const imageUrl = await uploadToS3(compressedBuffer, key, 'image/webp');
    
    // Save to database
    await prisma.gallery.create({
      data: {
        type: 'image',
        title,
        image: imageUrl
      }
    });
    
    revalidatePath('/');
    revalidatePath('/portal-leher/gallery');
    
    return NextResponse.json({ success: 'Item galeri berhasil ditambahkan!' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Gagal upload gambar. Coba lagi.' }, { status: 500 });
  }
}
