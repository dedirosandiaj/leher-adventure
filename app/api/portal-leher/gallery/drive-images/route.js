import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getDriveClient } from '@/lib/google-drive';

export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const pageToken = searchParams.get('pageToken');
    const pageSize = 50; // Number of images per page

    const drive = getDriveClient();

    // Search for all images in Google Drive (excluding trash)
    // Use 'mimeType contains "image/"' to get all image types
    const response = await drive.files.list({
      q: 'mimeType contains "image/" and trashed = false',
      fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink, webContentLink, thumbnailLink), nextPageToken',
      orderBy: 'modifiedTime desc',
      pageSize: pageSize,
      pageToken: pageToken || undefined,
    });

    // Add thumbnail URL for images - use our proxy endpoint
    const filesWithThumbnails = (response.data.files || []).map(file => {
      if (file.id) {
        return {
          ...file,
          thumbnailUrl: `/api/portal-leher/file-manager/image/${file.id}`,
        };
      }
      return file;
    });

    return NextResponse.json({
      files: filesWithThumbnails,
      total: filesWithThumbnails.length,
      nextPageToken: response.data.nextPageToken || null,
    });
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Google Drive' },
      { status: 500 }
    );
  }
}
