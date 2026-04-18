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

    const drive = getDriveClient();

    // Get file metadata to get download URL
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'mimeType',
    });

    // Download the file (thumbnail)
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
