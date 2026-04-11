import { NextResponse } from 'next/server';
import { getPresignedUrl } from '@/lib/s3';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }
    
    // Generate presigned URL valid for 1 hour
    const presignedUrl = await getPresignedUrl(key, 3600);
    
    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
  }
}
