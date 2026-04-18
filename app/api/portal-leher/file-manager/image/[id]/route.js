import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDriveClient } from '@/lib/google-drive';

export async function GET(request, { params }) {
  try {
    // Verify admin authentication
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_session')?.value;
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(adminToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { id: fileId } = await params;
    
    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Get size parameter from URL (default s220 for thumbnails)
    const { searchParams } = new URL(request.url);
    const size = searchParams.get('size') || 's220'; // s220 = 220px, s400 = 400px

    const drive = getDriveClient();

    // Get thumbnail URL from file metadata (much faster than downloading full file)
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType, thumbnailLink',
    });

    // If thumbnail link is available, use it with optimized size
    if (file.data.thumbnailLink) {
      // Replace size parameter with requested size
      const thumbnailUrl = file.data.thumbnailLink.replace(/=s[0-9]+-c/, `=${size}-c`);
      
      // Fetch the thumbnail
      const thumbnailResponse = await fetch(thumbnailUrl);
      const thumbnailBuffer = await thumbnailResponse.arrayBuffer();
      
      return new NextResponse(Buffer.from(thumbnailBuffer), {
        headers: {
          'Content-Type': file.data.mimeType || 'image/jpeg',
          'Cache-Control': 'public, max-age=604800', // 7 days cache for thumbnails
        },
      });
    }

    // Fallback: Download full file if no thumbnail
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: 'media',
      },
      {
        responseType: 'arraybuffer',
      }
    );

    const mimeType = file.data.mimeType || 'image/jpeg';
    
    return new NextResponse(response.data, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}
