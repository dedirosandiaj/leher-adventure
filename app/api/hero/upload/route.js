import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';

// Helper untuk mendapatkan timestamp WIB (Indonesia)
function getWIBTimestamp() {
  const now = new Date();
  // WIB = UTC+7
  const wibOffset = 7 * 60 * 60 * 1000; // 7 jam dalam milliseconds
  const wibTime = new Date(now.getTime() + wibOffset);
  return Math.floor(wibTime.getTime() / 1000);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('imageFile');
    
    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json({ error: 'File gambar wajib diupload.' }, { status: 400 });
    }
    
    // Compress dan convert ke WebP (kualitas 50%)
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const compressedBuffer = await sharp(buffer)
      .rotate() // Auto-rotate berdasarkan EXIF metadata
      .webp({ quality: 50, effort: 6 })
      .toBuffer();
    
    const timestamp = getWIBTimestamp();
    const originalName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
    const filename = `${timestamp}-${originalName}.webp`;
    const key = `hero/${filename}`;
    
    const url = await uploadToS3(compressedBuffer, key, 'image/webp');
    
    // Order berdasarkan timestamp WIB (terbaru di atas)
    const order = getWIBTimestamp();
    
    await prisma.media.create({ 
      data: { 
        url: url, 
        order: order,
        section: 'HERO',
        type: 'IMAGE'
      } 
    });
    
    // Revalidate cache
    revalidatePath('/');
    revalidatePath('/portal-leher/hero');
    
    return NextResponse.json({ success: 'Slide berhasil ditambahkan!' });
  } catch (err) {
    console.error('Error uploading hero slide:', err);
    return NextResponse.json({ error: 'Gagal upload: ' + err.message }, { status: 500 });
  }
}
