import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadToS3 } from '@/lib/s3';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';

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
      .webp({ quality: 50, effort: 6 })
      .toBuffer();
    
    const timestamp = Math.floor(Date.now() / 1000);
    const originalName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
    const filename = `${timestamp}-${originalName}.webp`;
    const key = `hero/${filename}`;
    
    const url = await uploadToS3(compressedBuffer, key, 'image/webp');
    
    // Order berdasarkan timestamp (terbaru di atas)
    const order = Math.floor(Date.now() / 1000);
    
    await prisma.heroSlide.create({ data: { image: url, order } });
    
    // Revalidate cache
    revalidatePath('/');
    revalidatePath('/portal-leher/hero');
    
    return NextResponse.json({ success: 'Slide berhasil ditambahkan!' });
  } catch (err) {
    console.error('Error uploading hero slide:', err);
    return NextResponse.json({ error: 'Gagal upload: ' + err.message }, { status: 500 });
  }
}
